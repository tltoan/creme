/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import rateLimiterTest from "@convex-dev/rate-limiter/test";
import { beforeAll, beforeEach, afterEach, expect, test, vi } from "vitest";
import { generateKeyPair, exportPKCS8, decodeJwt } from "jose";
import schema from "./schema";
import { api, internal } from "./_generated/api";
import {
  normalizeEmail,
  validatePassword,
  emailTemplate,
} from "./emailValidation";

const mail = vi.hoisted(() => ({
  messages: [] as { to: { address: string }; text: string }[],
}));
vi.mock("nodemailer", () => ({
  default: {
    createTransport: () => ({
      sendMail: async (message: { to: { address: string }; text: string }) => {
        mail.messages.push(message);
        return { accepted: [message.to.address] };
      },
      close() {},
    }),
  },
}));
const modules = import.meta.glob("./**/*.ts");
const email = "member@example.com",
  password = "a long test phrase 123",
  replacement = "a different test phrase 456";
let privateKey: string;
beforeAll(async () => {
  privateKey = await exportPKCS8(
    (await generateKeyPair("RS256", { extractable: true })).privateKey,
  );
});
beforeEach(() => {
  vi.stubEnv("JWT_PRIVATE_KEY", privateKey);
  vi.stubEnv("CONVEX_SITE_URL", "https://test.convex.site");
  vi.stubEnv("SITE_URL", "http://localhost:5173");
  vi.stubEnv("AUTH_GMAIL_USER", "sender@gmail.com");
  vi.stubEnv("AUTH_GMAIL_APP_PASSWORD", "test-only-never-used");
  vi.stubEnv("AUTH_EMAIL_ENABLED", "true");
  mail.messages.length = 0;
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});
function setup() {
  const t = convexTest(schema, modules);
  rateLimiterTest.register(t);
  return t;
}
type Backend = ReturnType<typeof setup>;
const login = (t: Pick<Backend, "action">, params: Record<string, string>) =>
  t.action(api.auth.signIn, {
    provider: "password",
    params: { email, ...params },
  });
function code() {
  return mail.messages.at(-1)!.text.match(/\b\d{8}\b/)![0];
}
async function verified(t: Backend) {
  const start = await login(t, { flow: "signUp", password });
  expect("tokens" in start ? start.tokens : null).toBeNull();
  const result = await login(t, { flow: "email-verification", code: code() });
  if (!("tokens" in result) || !result.tokens)
    throw new Error("Expected verified session");
  return t.withIdentity({ subject: decodeJwt(result.tokens.token).sub! });
}

test("email verification gates sessions and onboarding; passwords are hashed", async () => {
  const t = setup();
  const user = await verified(t);
  expect(await user.query(api.account.identity, {})).toEqual({
    email,
    emailVerified: true,
    hasPassword: true,
  });
  const account = await t.run((ctx) => ctx.db.query("authAccounts").first());
  expect(account?.secret).toBeTruthy();
  expect(account?.secret).not.toBe(password);
  const memberId = await user.mutation(api.members.requestAccess, {
    name: "Test Client",
    contactEmail: email,
    requestedRole: "client",
  });
  expect(await user.query(api.members.me, {})).toMatchObject({
    _id: memberId,
    status: "pending",
  });
  await expect(user.query(api.visits.mine, { from: 0 })).rejects.toThrow(
    "approval",
  );
  await expect(
    login(t, { flow: "signIn", password: "wrong password" }),
  ).rejects.toThrow();
  expect(await login(t, { flow: "signIn", password })).toHaveProperty(
    "tokens.token",
  );
});

test("codes reject wrong addresses, expiry, and replay", async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  const t = setup();
  await login(t, { flow: "signUp", password });
  const first = code();
  await expect(
    login(t, {
      flow: "email-verification",
      email: "other@example.com",
      code: first,
    }),
  ).rejects.toThrow();
  vi.setSystemTime(Date.now() + 11 * 60_000);
  await expect(
    login(t, { flow: "email-verification", code: first }),
  ).rejects.toThrow();
  await login(t, { flow: "email-verification" });
  const next = code();
  expect(
    await login(t, { flow: "email-verification", code: next }),
  ).toHaveProperty("tokens.token");
  await expect(
    login(t, { flow: "email-verification", code: next }),
  ).rejects.toThrow();
});

test("reset changes the password and immediately revokes earlier member sessions", async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  const t = setup(),
    user = await verified(t);
  await user.mutation(api.members.requestAccess, {
    name: "Test Cook",
    contactEmail: email,
    requestedRole: "cook",
  });
  vi.setSystemTime(Date.now() + 61_000);
  await login(t, { flow: "reset" });
  expect(
    await login(t, {
      flow: "reset-verification",
      code: code(),
      newPassword: replacement,
    }),
  ).toHaveProperty("tokens.token");
  await expect(user.query(api.members.me, {})).rejects.toThrow("Sign in");
  await expect(login(t, { flow: "signIn", password })).rejects.toThrow();
  expect(
    await login(t, { flow: "signIn", password: replacement }),
  ).toHaveProperty("tokens.token");
});

test("authenticated passkey members can add a password without losing approval", async () => {
  const t = setup();
  const subject = await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", {});
    const sessionId = await ctx.db.insert("authSessions", {
      userId,
      expirationTime: Date.now() + 86400_000,
    });
    return `${userId}|${sessionId}`;
  });
  const existing = t.withIdentity({ subject });
  const memberId = await existing.mutation(api.members.requestAccess, {
    name: "Existing Cook",
    contactEmail: email,
    requestedRole: "cook",
  });
  await t.mutation(internal.members.review, {
    memberId,
    role: "cook",
    decision: "approved",
    identityVerified: true,
    onboardingComplete: true,
    note: "Test verification",
  });
  await login(existing, { flow: "signUp", password });
  const result = await login(existing, {
    flow: "email-verification",
    code: code(),
  });
  if (!("tokens" in result) || !result.tokens)
    throw new Error("Expected tokens");
  const signedIn = t.withIdentity({
    subject: decodeJwt(result.tokens.token).sub!,
  });
  expect(await signedIn.query(api.members.me, {})).toMatchObject({
    _id: memberId,
    role: "cook",
    status: "approved",
  });
});

test("sending is rate limited; unknown reset is generic; missing config fails closed", async () => {
  const t = setup();
  expect(
    await login(t, { flow: "reset", email: "unknown@example.com" }),
  ).toMatchObject({ tokens: null });
  expect(mail.messages).toHaveLength(0);
  await login(t, { flow: "signUp", password });
  await expect(login(t, { flow: "email-verification" })).rejects.toThrow();
  expect(mail.messages).toHaveLength(1);
  expect(
    await login(t, { flow: "email-verification", code: code() }),
  ).toHaveProperty("tokens.token");
  vi.stubEnv("AUTH_EMAIL_ENABLED", "false");
  expect(await t.action(api.account.emailStatus, {})).toBe(false);
  await expect(
    login(t, { flow: "signUp", email: "new@example.com", password }),
  ).rejects.toThrow("not configured");
});

test("mailboxes and passwords reject unsafe or unsupported input", () => {
  expect(normalizeEmail(" Member+test@Example.com ")).toBe(
    "member+test@example.com",
  );
  for (const value of [
    "a@example.com\r\nBcc: b@example.com",
    "a@example.com,b@example.com",
    "Name <a@example.com>",
    "а@example.com",
    null,
  ])
    expect(() => normalizeEmail(value)).toThrow();
  expect(() => validatePassword("short")).toThrow();
  expect(() => validatePassword("x".repeat(129))).toThrow();
  expect(() => emailTemplate("verify", "<script>")).toThrow();
});

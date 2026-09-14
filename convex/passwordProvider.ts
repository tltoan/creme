import { Password } from "@convex-dev/auth/providers/Password";
import {
  ConvexCredentials,
  type ConvexCredentialsUserConfig,
} from "@convex-dev/auth/providers/ConvexCredentials";
import { Email } from "@convex-dev/auth/providers/Email";
import type {
  EmailConfig,
  GenericActionCtxWithAuthConfig,
} from "@convex-dev/auth/server";
import { RateLimiter, MINUTE, HOUR } from "@convex-dev/rate-limiter";
import { components, internal } from "./_generated/api";
import { env } from "./_generated/server";
import type { DataModel } from "./_generated/dataModel";
import { normalizeEmail, validatePassword } from "./emailValidation";

const limiter = new RateLimiter(components.rateLimiter, {
  authEmail: { kind: "token bucket", rate: 1, period: MINUTE, capacity: 1 },
  authEmailGlobal: {
    kind: "token bucket",
    rate: 100,
    period: HOUR,
    capacity: 20,
  },
});

export function emailReady() {
  return (
    env.AUTH_EMAIL_ENABLED === "true" &&
    Boolean(env.AUTH_GMAIL_USER && env.AUTH_GMAIL_APP_PASSWORD)
  );
}

function otp(kind: "verify" | "reset") {
  return Email({
    id: `mise-${kind}`,
    maxAge: 10 * 60,
    async generateVerificationToken() {
      let token = "";
      while (token.length < 8) {
        for (const byte of crypto.getRandomValues(new Uint8Array(16))) {
          if (byte < 250) token += String(byte % 10);
          if (token.length === 8) break;
        }
      }
      return token;
    },
    // This pinned Convex Auth version supplies ActionCtx as the second
    // argument, although Auth.js's email callback declaration omits it.
    sendVerificationRequest: (async (
      {
        identifier,
        token,
      }: Parameters<EmailConfig["sendVerificationRequest"]>[0],
      ctx?: GenericActionCtxWithAuthConfig<DataModel>,
    ) => {
      if (!ctx) throw new Error("Missing email action context.");
      if (!emailReady())
        throw new Error("Email sign-in is not configured yet.");
      const email = normalizeEmail(identifier);
      await ctx.runAction(internal.emailSender.sendCode, {
        to: email,
        code: token,
        kind,
      });
    }) as EmailConfig["sendVerificationRequest"],
  });
}

const basePassword = Password<DataModel>({
  verify: otp("verify"),
  reset: otp("reset"),
  validatePasswordRequirements: validatePassword,
  profile(params) {
    if (!emailReady()) throw new Error("Email sign-in is not configured yet.");
    return { email: normalizeEmail(params.email) };
  },
});

// Avoid revealing account existence through the password-reset endpoint.
// ConvexCredentials stores its implementation in Auth.js's options object;
// assigning the outer authorize field would be overwritten at normalization.
const passwordOptions = (
  basePassword as unknown as { options: ConvexCredentialsUserConfig<DataModel> }
).options;
export const emailPassword = ConvexCredentials<DataModel>({
  ...passwordOptions,
  authorize: async (params, ctx) => {
    if (!emailReady()) throw new Error("Email sign-in is not configured yet.");
    const email = normalizeEmail(params.email);
    // Reserve before Convex Auth replaces a stored code: rejected resends
    // must leave the already delivered code usable.
    const sendsCode =
      params.flow === "reset" ||
      (params.flow === "email-verification" && params.code === undefined) ||
      ((params.flow === "signIn" || params.flow === "signUp") &&
        (await ctx.runQuery(internal.account.needsVerification, { email })));
    if (sendsCode) {
      await limiter.limit(ctx, "authEmail", { key: email, throws: true });
      await limiter.limit(ctx, "authEmailGlobal", { throws: true });
    }
    try {
      return await passwordOptions.authorize(params, ctx);
    } catch (error) {
      if (
        params.flow === "reset" &&
        error instanceof Error &&
        error.message.includes("InvalidAccountId")
      )
        return null;
      throw error;
    }
  },
});

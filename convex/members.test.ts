/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import schema from "./schema";
import { api, internal } from "./_generated/api";
const modules = import.meta.glob("./**/*.ts");

async function setup() {
  const t = convexTest(schema, modules);
  const ids = await t.run(async (ctx) => {
    const clientUser = await ctx.db.insert("users", {});
    const otherUser = await ctx.db.insert("users", {});
    const cookUser = await ctx.db.insert("users", {});
    return { clientUser, otherUser, cookUser };
  });
  const client = t.withIdentity({ subject: ids.clientUser });
  const other = t.withIdentity({ subject: ids.otherUser });
  const cook = t.withIdentity({ subject: ids.cookUser });
  const make = (
    actor: typeof client,
    requestedRole: "client" | "cook",
    name: string,
  ) =>
    actor.mutation(api.members.requestAccess, {
      name,
      contactEmail: "same@example.invalid",
      requestedRole,
    });
  const clientId = await make(client, "client", "Client One"),
    otherId = await make(other, "client", "Client Two"),
    cookId = await make(cook, "cook", "Cook One");
  const approve = (memberId: typeof clientId, role: "client" | "cook") =>
    t.mutation(internal.members.review, {
      memberId,
      role,
      decision: "approved",
      identityVerified: true,
      onboardingComplete: true,
      note: "Unit test: independently verified",
    });
  return { t, client, other, cook, clientId, otherId, cookId, approve };
}

test("anonymous callers cannot access member data, visits, or availability", async () => {
  const { t } = await setup();
  await expect(t.query(api.members.me, {})).rejects.toThrow("Sign in");
  await expect(t.query(api.visits.mine, { from: 0 })).rejects.toThrow(
    "Sign in",
  );
  await expect(
    t.mutation(api.members.saveAvailability, { slots: [], note: "" }),
  ).rejects.toThrow("Sign in");
});

test("selecting a role does not grant access; approval requires identity and onboarding", async () => {
  const { t, client, clientId } = await setup();
  await expect(client.query(api.visits.mine, { from: 0 })).rejects.toThrow(
    "approval",
  );
  await expect(
    client.mutation(api.members.saveAvailability, { slots: [], note: "" }),
  ).rejects.toThrow("approval");
  await expect(
    t.mutation(internal.members.review, {
      memberId: clientId,
      role: "client",
      decision: "approved",
      identityVerified: false,
      onboardingComplete: true,
      note: "Unverified",
    }),
  ).rejects.toThrow("Verify");
  expect(await client.query(api.members.me, {})).toMatchObject({
    status: "pending",
    requestedRole: "client",
  });
});

test("duplicate emails never link accounts or inherit approval", async () => {
  const { client, other, clientId, otherId, approve } = await setup();
  await approve(clientId, "client");
  expect(clientId).not.toBe(otherId);
  expect(await other.query(api.members.me, {})).toMatchObject({
    _id: otherId,
    status: "pending",
  });
  await expect(other.query(api.visits.mine, { from: 0 })).rejects.toThrow(
    "approval",
  );
  expect(await client.query(api.members.me, {})).toMatchObject({
    _id: clientId,
    status: "approved",
  });
});

test("role tampering cannot change approval or assigned role", async () => {
  const { client, clientId, approve } = await setup();
  await approve(clientId, "client");
  await client.mutation(api.members.requestAccess, {
    name: "New Name",
    contactEmail: "changed@example.invalid",
    requestedRole: "cook",
  });
  expect(await client.query(api.members.me, {})).toMatchObject({
    role: "client",
    name: "Client One",
  });
});

test("visits are scoped to the authenticated client or assigned cook", async () => {
  const { t, client, other, cook, clientId, otherId, cookId, approve } =
    await setup();
  await approve(clientId, "client");
  await approve(otherId, "client");
  await approve(cookId, "cook");
  const [mine, theirs] = await t.run(async (ctx) => [
    await ctx.db.insert("visits", {
      clientId,
      cookId,
      startsAt: 100,
      endsAt: 200,
      status: "confirmed",
      menu: "Private menu one",
    }),
    await ctx.db.insert("visits", {
      clientId: otherId,
      startsAt: 100,
      endsAt: 200,
      status: "confirmed",
      menu: "Private menu two",
    }),
  ]);
  expect(
    (await client.query(api.visits.mine, { from: 0 })).map((v) => v.id),
  ).toEqual([mine]);
  expect(
    (await cook.query(api.visits.mine, { from: 0 })).map((v) => v.id),
  ).toEqual([mine]);
  expect(
    (await other.query(api.visits.mine, { from: 0 })).map((v) => v.id),
  ).toEqual([theirs]);
});

test("availability persists only for its owner and rejects malformed input", async () => {
  const { client, other, clientId, otherId, approve } = await setup();
  await approve(clientId, "client");
  await approve(otherId, "client");
  await client.mutation(api.members.saveAvailability, {
    slots: [{ day: "Saturday", window: "morning" }],
    note: "Before noon",
  });
  expect((await client.query(api.members.me, {}))?.availabilityNote).toBe(
    "Before noon",
  );
  expect((await other.query(api.members.me, {}))?.availability).toEqual([]);
  await expect(
    client.mutation(api.members.saveAvailability, {
      slots: [
        { day: "Saturday", window: "morning" },
        { day: "Saturday", window: "morning" },
      ],
      note: "",
    }),
  ).rejects.toThrow("six");
  await expect(
    client.mutation(api.members.saveAvailability, {
      slots: [],
      note: "x".repeat(501),
    }),
  ).rejects.toThrow("500");
});

test("suspension immediately removes schedule and write access", async () => {
  const { t, client, clientId, approve } = await setup();
  await approve(clientId, "client");
  await t.mutation(internal.members.review, {
    memberId: clientId,
    role: "client",
    decision: "suspended",
    identityVerified: false,
    onboardingComplete: false,
    note: "Paused",
  });
  await expect(client.query(api.visits.mine, { from: 0 })).rejects.toThrow(
    "approval",
  );
  await expect(
    client.mutation(api.members.saveAvailability, { slots: [], note: "" }),
  ).rejects.toThrow("approval");
});

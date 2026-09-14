import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const role = v.union(v.literal("client"), v.literal("cook"));
export const status = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("suspended"),
);
export const window = v.union(
  v.literal("morning"),
  v.literal("afternoon"),
  v.literal("evening"),
);
export const availabilitySlot = v.object({
  day: v.union(v.literal("Saturday"), v.literal("Sunday")),
  window,
});
export default defineSchema({
  ...authTables,
  members: defineTable({
    userId: v.id("users"),
    name: v.string(),
    contactEmail: v.string(),
    requestedRole: role,
    role: v.optional(role),
    status,
    identityVerifiedAt: v.optional(v.number()),
    onboardedAt: v.optional(v.number()),
    availability: v.array(availabilitySlot),
    availabilityNote: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),
  visits: defineTable({
    clientId: v.id("members"),
    cookId: v.optional(v.id("members")),
    startsAt: v.number(),
    endsAt: v.number(),
    status: v.union(
      v.literal("requested"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
    menu: v.string(),
  })
    .index("by_clientId_and_startsAt", ["clientId", "startsAt"])
    .index("by_cookId_and_startsAt", ["cookId", "startsAt"]),
  memberAudit: defineTable({
    memberId: v.id("members"),
    action: v.string(),
    note: v.string(),
  }).index("by_memberId", ["memberId"]),
});

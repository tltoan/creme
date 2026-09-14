import { requireSignedInUserId } from "./authIdentity";
import { ConvexError, v } from "convex/values";
import {
  query,
  mutation,
  internalMutation,
  internalQuery,
  type QueryCtx,
  type MutationCtx,
} from "./_generated/server";
import schema, { role, availabilitySlot } from "./schema";

async function currentMember(ctx: QueryCtx | MutationCtx) {
  const userId = await requireSignedInUserId(ctx);
  return ctx.db
    .query("members")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();
}

export async function requireApprovedMember(ctx: QueryCtx | MutationCtx) {
  const member = await currentMember(ctx);
  if (
    !member ||
    member.status !== "approved" ||
    !member.role ||
    !member.identityVerifiedAt ||
    !member.onboardedAt
  )
    throw new ConvexError("Your account needs Misé approval.");
  return member;
}

export const me = query({
  args: {},
  returns: v.union(schema.doc("members"), v.null()),
  handler: currentMember,
});

// A role selected here is only an application preference. It grants no access.
export const requestAccess = mutation({
  args: { name: v.string(), contactEmail: v.string(), requestedRole: role },
  returns: v.id("members"),
  handler: async (ctx, args) => {
    const userId = await requireSignedInUserId(ctx);
    const existing = await currentMember(ctx);
    if (existing) return existing._id;
    const name = args.name.trim();
    const contactEmail = args.contactEmail.trim().toLowerCase();
    const user = await ctx.db.get(userId);
    if (user?.emailVerificationTime && user.email !== contactEmail)
      throw new ConvexError("Use your verified account email.");
    if (
      name.length < 2 ||
      name.length > 100 ||
      contactEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)
    )
      throw new ConvexError("Enter your name and a valid contact email.");
    return ctx.db.insert("members", {
      userId,
      name,
      contactEmail,
      requestedRole: args.requestedRole,
      status: "pending",
      availability: [],
      availabilityNote: "",
    });
  },
});

export const saveAvailability = mutation({
  args: { slots: v.array(availabilitySlot), note: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const member = await requireApprovedMember(ctx);
    if (
      args.slots.length > 6 ||
      new Set(args.slots.map((s) => `${s.day}:${s.window}`)).size !==
        args.slots.length ||
      args.note.length > 500
    )
      throw new ConvexError(
        "Choose up to six windows and keep notes under 500 characters.",
      );
    await ctx.db.patch(member._id, {
      availability: args.slots,
      availabilityNote: args.note.trim(),
    });
    return null;
  },
});

// Staff operations are available only through the authenticated Convex dashboard/CLI.
// Never approve by matching a self-asserted email. Verify the account reference
// with the person through the contact channel recorded during onboarding.
export const review = internalMutation({
  args: {
    memberId: v.id("members"),
    role,
    decision: v.union(v.literal("approved"), v.literal("suspended")),
    identityVerified: v.boolean(),
    onboardingComplete: v.boolean(),
    note: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.memberId);
    if (!member) throw new ConvexError("Member not found.");
    if (!args.note.trim() || args.note.length > 1000)
      throw new ConvexError("Add a short review note.");
    if (
      args.decision === "approved" &&
      (!args.identityVerified || !args.onboardingComplete)
    )
      throw new ConvexError(
        "Verify the person and complete onboarding before approval.",
      );
    await ctx.db.patch(member._id, {
      role: args.role,
      status: args.decision,
      ...(args.decision === "approved"
        ? { identityVerifiedAt: Date.now(), onboardedAt: Date.now() }
        : {}),
    });
    await ctx.db.insert("memberAudit", {
      memberId: member._id,
      action: args.decision,
      note: args.note.trim(),
    });
    return null;
  },
});

export const pending = internalQuery({
  args: {},
  returns: v.array(schema.doc("members")),
  handler: (ctx) =>
    ctx.db
      .query("members")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .take(100),
});

import { action, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { requireSignedInUserId } from "./authIdentity";
import { emailReady } from "./passwordProvider";

export const emailStatus = action({
  args: {},
  returns: v.boolean(),
  handler: async () => emailReady(),
});
export const needsVerification = internalQuery({
  args: { email: v.string() },
  returns: v.boolean(),
  handler: async (ctx, { email }) => {
    const account = await ctx.db
      .query("authAccounts")
      .withIndex("providerAndAccountId", (q) =>
        q.eq("provider", "password").eq("providerAccountId", email),
      )
      .unique();
    return !account?.emailVerified;
  },
});
export const identity = query({
  args: {},
  returns: v.object({
    email: v.union(v.string(), v.null()),
    emailVerified: v.boolean(),
    hasPassword: v.boolean(),
  }),
  handler: async (ctx) => {
    const userId = await requireSignedInUserId(ctx);
    const user = await ctx.db.get(userId);
    const password = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) =>
        q.eq("userId", userId).eq("provider", "password"),
      )
      .first();
    return {
      email: user?.email ?? null,
      emailVerified: Boolean(password?.emailVerified),
      hasPassword: Boolean(password),
    };
  },
});

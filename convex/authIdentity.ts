import { getAuthSessionId, getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { QueryCtx, MutationCtx } from "./_generated/server";

export async function requireSignedInUserId(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  const sessionId = await getAuthSessionId(ctx);
  const session = sessionId ? await ctx.db.get(sessionId) : null;
  // A reset/logout deletes sessions. Check this as well as the JWT so access
  // ends immediately, even before an already-issued access token expires.
  if (!userId || !session || session.userId !== userId)
    throw new ConvexError("Sign in to continue.");
  return userId;
}

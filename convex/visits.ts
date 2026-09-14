import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireApprovedMember } from "./members";

export const mine = query({
  args: { from: v.number() },
  returns: v.array(
    v.object({
      id: v.id("visits"),
      startsAt: v.number(),
      endsAt: v.number(),
      status: v.union(
        v.literal("requested"),
        v.literal("confirmed"),
        v.literal("completed"),
        v.literal("cancelled"),
      ),
      menu: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const member = await requireApprovedMember(ctx);
    const rows =
      member.role === "client"
        ? await ctx.db
            .query("visits")
            .withIndex("by_clientId_and_startsAt", (q) =>
              q.eq("clientId", member._id).gte("startsAt", args.from),
            )
            .take(50)
        : await ctx.db
            .query("visits")
            .withIndex("by_cookId_and_startsAt", (q) =>
              q.eq("cookId", member._id).gte("startsAt", args.from),
            )
            .take(50);
    return rows.map((r) => ({
      id: r._id,
      startsAt: r.startsAt,
      endsAt: r.endsAt,
      status: r.status,
      menu: r.menu,
    }));
  },
});

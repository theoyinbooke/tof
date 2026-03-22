import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireAdmin } from "./authHelpers";
import { Id } from "./_generated/dataModel";
import { MutationCtx } from "./_generated/server";

export async function logAuditEvent(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    action: string;
    resource: string;
    resourceId?: string;
    details?: string;
  },
) {
  await ctx.db.insert("auditLogs", {
    userId: args.userId,
    action: args.action,
    resource: args.resource,
    resourceId: args.resourceId,
    details: args.details,
    createdAt: Date.now(),
  });
}

export const list = query({
  args: {
    action: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const maxItems = args.limit || 100;

    if (args.action) {
      const logs = await ctx.db
        .query("auditLogs")
        .withIndex("by_action", (q) => q.eq("action", args.action!))
        .order("desc")
        .take(maxItems);

      const enriched = await Promise.all(
        logs.map(async (l) => {
          const user = await ctx.db.get(l.userId);
          return { ...l, userName: user?.name };
        }),
      );
      return enriched;
    }

    const logs = await ctx.db
      .query("auditLogs")
      .order("desc")
      .take(maxItems);

    const enriched = await Promise.all(
      logs.map(async (l) => {
        const user = await ctx.db.get(l.userId);
        return { ...l, userName: user?.name };
      }),
    );
    return enriched;
  },
});

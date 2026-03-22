import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireUser, requireOwnerOrAdmin, requireAdmin } from "../authHelpers";

export const getByAssignment = query({
  args: { assignmentId: v.id("assessmentAssignments") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) return null;

    if (user.role !== "admin" && assignment.userId !== user._id) {
      throw new Error("Unauthorized.");
    }

    const scores = await ctx.db
      .query("assessmentScores")
      .withIndex("by_assignmentId", (q) => q.eq("assignmentId", args.assignmentId))
      .take(1);

    return scores[0] || null;
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireOwnerOrAdmin(ctx, args.userId);

    const scores = await ctx.db
      .query("assessmentScores")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .take(100);

    const enriched = await Promise.all(
      scores.map(async (s) => {
        const template = await ctx.db.get(s.templateId);
        return { ...s, template };
      }),
    );

    return enriched;
  },
});

export const listFlagged = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const mentorNotify = await ctx.db
      .query("assessmentScores")
      .withIndex("by_flagBehavior", (q) => q.eq("flagBehavior", "mentor_notify"))
      .take(100);

    const adminReview = await ctx.db
      .query("assessmentScores")
      .withIndex("by_flagBehavior", (q) => q.eq("flagBehavior", "admin_review"))
      .take(100);

    const flagged = [...adminReview, ...mentorNotify];

    const enriched = await Promise.all(
      flagged.map(async (s) => {
        const user = await ctx.db.get(s.userId);
        const template = await ctx.db.get(s.templateId);
        return { ...s, user, template };
      }),
    );

    return enriched;
  },
});

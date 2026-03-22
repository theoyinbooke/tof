import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireAdminOrMentor, requireUser } from "./authHelpers";
import { logAuditEvent } from "./auditLogs";
import { Id } from "./_generated/dataModel";
import { MutationCtx } from "./_generated/server";

/**
 * Auto-create safeguarding action when a score has a flag behavior.
 * Called from the scoring engine after score generation.
 */
export async function createSafeguardingAction(
  ctx: MutationCtx,
  args: {
    scoreId: Id<"assessmentScores">;
    userId: Id<"users">;
    flagBehavior: "mentor_notify" | "admin_review";
  },
) {
  // Check if action already exists for this score
  const existing = await ctx.db
    .query("safeguardingActions")
    .withIndex("by_scoreId", (q) => q.eq("scoreId", args.scoreId))
    .take(1);

  if (existing.length > 0) return existing[0]._id;

  // If mentor_notify, find active mentor
  let assignedTo: Id<"users"> | undefined;
  if (args.flagBehavior === "mentor_notify") {
    const mentorAssignment = await ctx.db
      .query("mentorAssignments")
      .withIndex("by_beneficiaryUserId_and_isActive", (q) =>
        q.eq("beneficiaryUserId", args.userId).eq("isActive", true),
      )
      .take(1);

    if (mentorAssignment.length > 0) {
      assignedTo = mentorAssignment[0].mentorId;
    }
  }

  return await ctx.db.insert("safeguardingActions", {
    scoreId: args.scoreId,
    userId: args.userId,
    assignedTo,
    flagBehavior: args.flagBehavior,
    status: "open",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}

export const listAll = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("open"),
        v.literal("in_progress"),
        v.literal("resolved"),
        v.literal("dismissed"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    let actions;
    if (args.status) {
      actions = await ctx.db
        .query("safeguardingActions")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .take(200);
    } else {
      actions = await ctx.db.query("safeguardingActions").take(200);
    }

    const enriched = await Promise.all(
      actions.map(async (a) => {
        const user = await ctx.db.get(a.userId);
        const score = await ctx.db.get(a.scoreId);
        const template = score ? await ctx.db.get(score.templateId) : null;
        const assignee = a.assignedTo ? await ctx.db.get(a.assignedTo) : null;
        return { ...a, user, score, template, assignee };
      }),
    );

    return enriched;
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdminOrMentor(ctx);

    const actions = await ctx.db
      .query("safeguardingActions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .take(50);

    const enriched = await Promise.all(
      actions.map(async (a) => {
        const score = await ctx.db.get(a.scoreId);
        const template = score ? await ctx.db.get(score.templateId) : null;
        return { ...a, score, template };
      }),
    );

    return enriched;
  },
});

export const getMyAssigned = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    if (user.role !== "mentor" && user.role !== "admin") {
      return [];
    }

    const actions = await ctx.db
      .query("safeguardingActions")
      .withIndex("by_assignedTo", (q) => q.eq("assignedTo", user._id))
      .take(50);

    const enriched = await Promise.all(
      actions.map(async (a) => {
        const beneficiary = await ctx.db.get(a.userId);
        const score = await ctx.db.get(a.scoreId);
        const template = score ? await ctx.db.get(score.templateId) : null;
        return { ...a, beneficiary, score, template };
      }),
    );

    return enriched;
  },
});

export const updateAction = mutation({
  args: {
    actionId: v.id("safeguardingActions"),
    status: v.optional(
      v.union(
        v.literal("open"),
        v.literal("in_progress"),
        v.literal("resolved"),
        v.literal("dismissed"),
      ),
    ),
    recommendedAction: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    resolutionNote: v.optional(v.string()),
    assignedTo: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const action = await ctx.db.get(args.actionId);
    if (!action) throw new Error("Action not found.");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.status !== undefined) patch.status = args.status;
    if (args.recommendedAction !== undefined) patch.recommendedAction = args.recommendedAction;
    if (args.dueDate !== undefined) patch.dueDate = args.dueDate;
    if (args.assignedTo !== undefined) patch.assignedTo = args.assignedTo;

    if (args.resolutionNote !== undefined) {
      patch.resolutionNote = args.resolutionNote;
    }

    if (args.status === "resolved" || args.status === "dismissed") {
      patch.resolvedBy = admin._id;
      patch.resolvedAt = Date.now();
    }

    await ctx.db.patch(args.actionId, patch);

    if (args.status === "resolved" || args.status === "dismissed") {
      await logAuditEvent(ctx, {
        userId: admin._id,
        action: `safeguarding_${args.status}`,
        resource: "safeguardingActions",
        resourceId: args.actionId,
        details: args.resolutionNote,
      });
    }

    return args.actionId;
  },
});

// ─── Sensitive Data Queries ───
// These provide role-appropriate views of assessment data

export const getScoreSummaryForMentor = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await requireAdminOrMentor(ctx);

    // Mentors can only see their mentees
    if (user.role === "mentor") {
      const assignments = await ctx.db
        .query("mentorAssignments")
        .withIndex("by_mentorId_and_isActive", (q) =>
          q.eq("mentorId", user._id).eq("isActive", true),
        )
        .take(100);

      const isMentee = assignments.some((a) => a.beneficiaryUserId === args.userId);
      if (!isMentee) throw new Error("Not your mentee.");
    }

    const scores = await ctx.db
      .query("assessmentScores")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .take(100);

    // Return summary only — no item-level responses
    return scores.map((s) => ({
      _id: s._id,
      templateId: s.templateId,
      totalScore: s.totalScore,
      severityBand: s.severityBand,
      interpretation: s.interpretation,
      scoredAt: s.scoredAt,
    }));
  },
});

export const getScoreSummaryForBeneficiary = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    const scores = await ctx.db
      .query("assessmentScores")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(100);

    // Beneficiaries see interpretation only, not raw scores
    const enriched = await Promise.all(
      scores.map(async (s) => {
        const template = await ctx.db.get(s.templateId);
        return {
          _id: s._id,
          templateName: template?.name,
          templateShortCode: template?.shortCode,
          severityBand: s.severityBand,
          interpretation: s.interpretation,
          scoredAt: s.scoredAt,
        };
      }),
    );

    return enriched;
  },
});

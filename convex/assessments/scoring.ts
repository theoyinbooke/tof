import { v } from "convex/values";
import { query } from "../_generated/server";
import { Id } from "../_generated/dataModel";
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

export const getCohortAssessmentSummary = query({
  args: { cohortId: v.id("cohorts") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    if (user.role !== "admin") throw new Error("Unauthorized");

    // Get all sessions for this cohort
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_cohortId", (q) => q.eq("cohortId", args.cohortId))
      .take(100);

    // For each session, get assignments and scores
    const summaries = [];
    for (const session of sessions) {
      const assignments = await ctx.db
        .query("assessmentAssignments")
        .withIndex("by_sessionId", (q) => q.eq("sessionId", session._id))
        .take(500);

      if (assignments.length === 0) continue;

      // Group by templateId
      const byTemplate: Record<string, typeof assignments> = {};
      for (const a of assignments) {
        const key = a.templateId as string;
        if (!byTemplate[key]) byTemplate[key] = [];
        byTemplate[key].push(a);
      }

      for (const [templateId, templateAssignments] of Object.entries(
        byTemplate,
      )) {
        const template = await ctx.db.get(
          templateId as unknown as Id<"assessmentTemplates">,
        );
        if (!template) continue;

        const completed = templateAssignments.filter(
          (a) => a.status === "completed",
        );

        // Get scores for completed assignments
        let totalScoreSum = 0;
        let scoreCount = 0;
        let flaggedCount = 0;
        const bandCounts: Record<string, number> = {};

        for (const a of completed) {
          const scores = await ctx.db
            .query("assessmentScores")
            .withIndex("by_assignmentId", (q) => q.eq("assignmentId", a._id))
            .take(1);

          if (scores.length > 0) {
            const score = scores[0];
            if (score.totalScore != null) {
              totalScoreSum += score.totalScore;
              scoreCount++;
            }
            if (score.severityBand) {
              bandCounts[score.severityBand] =
                (bandCounts[score.severityBand] || 0) + 1;
            }
            if (score.flagBehavior && score.flagBehavior !== "none") {
              flaggedCount++;
            }
          }
        }

        summaries.push({
          templateId,
          templateName: template.name,
          shortCode: template.shortCode,
          sessionNumber: session.sessionNumber,
          sessionTitle: session.title,
          totalAssigned: templateAssignments.length,
          completedCount: completed.length,
          averageScore:
            scoreCount > 0
              ? Math.round((totalScoreSum / scoreCount) * 10) / 10
              : null,
          flaggedCount,
          bandCounts,
        });
      }
    }

    return summaries.sort((a, b) => a.sessionNumber - b.sessionNumber);
  },
});

// ─── Admin Dashboard Queries ───

/**
 * getCohortOverview — aggregate stats for the admin assessment dashboard.
 * Returns per-template stats including completion counts, averages,
 * severity band distributions, and flagged counts, grouped by pillar.
 */
export const getCohortOverview = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Get all published templates
    const templates = await ctx.db
      .query("assessmentTemplates")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .take(50);

    const templateStats = await Promise.all(
      templates.map(async (template) => {
        // Count assignments for this template
        const assignments = await ctx.db
          .query("assessmentAssignments")
          .withIndex("by_templateId", (q) => q.eq("templateId", template._id))
          .take(500);

        const totalAssigned = assignments.length;
        const completedAssignments = assignments.filter(
          (a) => a.status === "completed",
        );
        const totalCompleted = completedAssignments.length;

        // Get scores for this template
        const scores = await ctx.db
          .query("assessmentScores")
          .withIndex("by_templateId", (q) => q.eq("templateId", template._id))
          .take(500);

        // Compute average score
        let avgScore: number | undefined;
        if (scores.length > 0) {
          const scoresWithTotal = scores.filter(
            (s) => s.totalScore !== undefined,
          );
          if (scoresWithTotal.length > 0) {
            const sum = scoresWithTotal.reduce(
              (acc, s) => acc + (s.totalScore ?? 0),
              0,
            );
            avgScore = sum / scoresWithTotal.length;
          }
        }

        // Count severity band distribution
        const bandDistribution: Record<string, number> = {};
        for (const score of scores) {
          const band = score.severityBand || "Unscored";
          bandDistribution[band] = (bandDistribution[band] || 0) + 1;
        }

        // Count flagged scores
        let mentorNotifyCount = 0;
        let adminReviewCount = 0;
        for (const score of scores) {
          if (score.flagBehavior === "mentor_notify") mentorNotifyCount++;
          if (score.flagBehavior === "admin_review") adminReviewCount++;
        }

        return {
          templateId: template._id,
          name: template.name,
          shortCode: template.shortCode,
          pillar: template.pillar,
          sessionNumber: template.sessionNumber,
          totalScoreRange: template.totalScoreRange,
          scoringMethod: template.scoringMethod,
          severityBands: template.severityBands,
          totalAssigned,
          totalCompleted,
          completionRate:
            totalAssigned > 0 ? totalCompleted / totalAssigned : 0,
          avgScore,
          bandDistribution,
          mentorNotifyCount,
          adminReviewCount,
          totalFlagged: mentorNotifyCount + adminReviewCount,
        };
      }),
    );

    // Aggregate totals
    const totalCompleted = templateStats.reduce(
      (acc, t) => acc + t.totalCompleted,
      0,
    );
    const totalAssigned = templateStats.reduce(
      (acc, t) => acc + t.totalAssigned,
      0,
    );
    const totalFlagged = templateStats.reduce(
      (acc, t) => acc + t.totalFlagged,
      0,
    );
    const avgCompletionRate =
      totalAssigned > 0 ? totalCompleted / totalAssigned : 0;

    // Group by pillar
    const pillarGroups: Record<
      string,
      { pillar: string; templates: typeof templateStats; avgScore?: number }
    > = {};
    for (const stat of templateStats) {
      const pillar = stat.pillar || "Uncategorized";
      if (!pillarGroups[pillar]) {
        pillarGroups[pillar] = { pillar, templates: [] };
      }
      pillarGroups[pillar].templates.push(stat);
    }

    // Compute pillar averages
    for (const group of Object.values(pillarGroups)) {
      const withScores = group.templates.filter(
        (t) => t.avgScore !== undefined,
      );
      if (withScores.length > 0) {
        group.avgScore =
          withScores.reduce((acc, t) => acc + (t.avgScore ?? 0), 0) /
          withScores.length;
      }
    }

    return {
      totalCompleted,
      totalAssigned,
      avgCompletionRate,
      totalFlagged,
      templateStats,
      pillarGroups,
    };
  },
});

/**
 * listFlaggedScores — all scores with flagBehavior != none, with enriched data.
 * Supports filtering by flag level.
 */
export const listFlaggedScores = query({
  args: {
    flagFilter: v.optional(
      v.union(v.literal("mentor_notify"), v.literal("admin_review")),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    let flaggedScores;
    if (args.flagFilter) {
      flaggedScores = await ctx.db
        .query("assessmentScores")
        .withIndex("by_flagBehavior", (q) =>
          q.eq("flagBehavior", args.flagFilter!),
        )
        .take(200);
    } else {
      const mentorNotify = await ctx.db
        .query("assessmentScores")
        .withIndex("by_flagBehavior", (q) =>
          q.eq("flagBehavior", "mentor_notify"),
        )
        .take(100);

      const adminReview = await ctx.db
        .query("assessmentScores")
        .withIndex("by_flagBehavior", (q) =>
          q.eq("flagBehavior", "admin_review"),
        )
        .take(100);

      flaggedScores = [...adminReview, ...mentorNotify];
    }

    const enriched = await Promise.all(
      flaggedScores.map(async (score) => {
        const user = await ctx.db.get(score.userId);
        const template = await ctx.db.get(score.templateId);

        // Check for existing safeguarding action
        const safeguardingActions = await ctx.db
          .query("safeguardingActions")
          .withIndex("by_scoreId", (q) => q.eq("scoreId", score._id))
          .take(1);

        const safeguardingAction = safeguardingActions[0] || null;

        return {
          ...score,
          userName: user?.name || "Unknown",
          userId: score.userId,
          templateName: template?.name || "Unknown",
          templateShortCode: template?.shortCode || "?",
          safeguardingAction: safeguardingAction
            ? {
                _id: safeguardingAction._id,
                status: safeguardingAction.status,
                assignedTo: safeguardingAction.assignedTo,
              }
            : null,
        };
      }),
    );

    // Sort by scoredAt descending (newest first)
    enriched.sort((a, b) => b.scoredAt - a.scoredAt);

    return enriched;
  },
});

/**
 * getScoreDetail — full score detail for admin view.
 * Returns score, response (with raw answers), template, user, cross-references,
 * and safeguarding action if it exists.
 */
export const getScoreDetail = query({
  args: { scoreId: v.id("assessmentScores") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const score = await ctx.db.get(args.scoreId);
    if (!score) return null;

    const template = await ctx.db.get(score.templateId);
    const user = await ctx.db.get(score.userId);

    // Get the response (raw answers)
    const response = await ctx.db.get(score.responseId);

    // Get the assignment
    const assignment = await ctx.db.get(score.assignmentId);

    // Get all other scores for this user (for cross-reference)
    const allUserScores = await ctx.db
      .query("assessmentScores")
      .withIndex("by_userId", (q) => q.eq("userId", score.userId))
      .take(100);

    const otherScores = await Promise.all(
      allUserScores
        .filter((s) => s._id !== score._id)
        .map(async (s) => {
          const tmpl = await ctx.db.get(s.templateId);
          return {
            _id: s._id,
            templateName: tmpl?.name || "Unknown",
            templateShortCode: tmpl?.shortCode || "?",
            sessionNumber: tmpl?.sessionNumber,
            totalScore: s.totalScore,
            subscaleScores: s.subscaleScores,
            severityBand: s.severityBand,
            flagBehavior: s.flagBehavior,
            scoredAt: s.scoredAt,
          };
        }),
    );

    // Get safeguarding action if exists
    const safeguardingActions = await ctx.db
      .query("safeguardingActions")
      .withIndex("by_scoreId", (q) => q.eq("scoreId", args.scoreId))
      .take(1);

    const safeguardingAction = safeguardingActions[0] || null;

    // Get the session info if linked
    let session = null;
    if (assignment?.sessionId) {
      session = await ctx.db.get(assignment.sessionId);
    }

    return {
      score,
      template,
      user: user
        ? { _id: user._id, name: user.name, email: user.email, role: user.role }
        : null,
      response: response
        ? {
            _id: response._id,
            answers: response.answers,
            submittedAt: response.submittedAt,
          }
        : null,
      assignment: assignment
        ? {
            _id: assignment._id,
            status: assignment.status,
            sessionId: assignment.sessionId,
            dueDate: assignment.dueDate,
          }
        : null,
      session: session
        ? {
            _id: session._id,
            title: session.title,
            sessionNumber: session.sessionNumber,
            pillar: session.pillar,
          }
        : null,
      otherScores,
      safeguardingAction,
    };
  },
});

/**
 * getAssignmentsByTemplate — list all assignments for a given template,
 * enriched with user and score data.
 */
export const getAssignmentsByTemplate = query({
  args: { templateId: v.id("assessmentTemplates") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const assignments = await ctx.db
      .query("assessmentAssignments")
      .withIndex("by_templateId", (q) => q.eq("templateId", args.templateId))
      .take(200);

    const enriched = await Promise.all(
      assignments.map(async (a) => {
        const user = await ctx.db.get(a.userId);

        // Get score if completed
        const scores = await ctx.db
          .query("assessmentScores")
          .withIndex("by_assignmentId", (q) => q.eq("assignmentId", a._id))
          .take(1);

        const score = scores[0] || null;

        return {
          ...a,
          userName: user?.name || "Unknown",
          userEmail: user?.email || "",
          score: score
            ? {
                _id: score._id,
                totalScore: score.totalScore,
                subscaleScores: score.subscaleScores,
                severityBand: score.severityBand,
                flagBehavior: score.flagBehavior,
                scoredAt: score.scoredAt,
              }
            : null,
        };
      }),
    );

    return enriched;
  },
});

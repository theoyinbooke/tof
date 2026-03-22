import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireUser } from "../authHelpers";

/**
 * getResultForBeneficiary — returns the full result view data for a completed assignment.
 * Includes: score, template metadata, severity bands, subscale info, platform display text,
 * and previous scores for the same instrument for growth tracking.
 */
export const getResultForBeneficiary = query({
  args: { assignmentId: v.id("assessmentAssignments") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) return null;

    // Only the owner or an admin can view
    if (user.role !== "admin" && assignment.userId !== user._id) {
      throw new Error("Unauthorized.");
    }

    if (assignment.status !== "completed") {
      return null;
    }

    const template = await ctx.db.get(assignment.templateId);
    if (!template) return null;

    // Get the score record for this assignment
    const scores = await ctx.db
      .query("assessmentScores")
      .withIndex("by_assignmentId", (q) =>
        q.eq("assignmentId", args.assignmentId),
      )
      .take(1);

    const score = scores[0] || null;
    if (!score) return null;

    // Get the response record for submitted date
    const responses = await ctx.db
      .query("assessmentResponses")
      .withIndex("by_assignmentId", (q) =>
        q.eq("assignmentId", args.assignmentId),
      )
      .take(1);

    const response = responses[0] || null;

    // Get the session info if linked
    let session = null;
    if (assignment.sessionId) {
      session = await ctx.db.get(assignment.sessionId);
    }

    // ── Growth Tracking: find previous scores for the same templateId + userId ──
    const allScoresForTemplate = await ctx.db
      .query("assessmentScores")
      .withIndex("by_userId", (q) => q.eq("userId", assignment.userId))
      .take(100);

    // Filter to only scores for the same template, sorted by scoredAt
    const previousScores = allScoresForTemplate
      .filter(
        (s) =>
          s.templateId === assignment.templateId &&
          s._id !== score._id,
      )
      .sort((a, b) => a.scoredAt - b.scoredAt)
      .map((s) => ({
        _id: s._id,
        totalScore: s.totalScore,
        subscaleScores: s.subscaleScores,
        severityBand: s.severityBand,
        scoredAt: s.scoredAt,
      }));

    // Compute subscale ranges from template definition
    const subscaleRanges: Record<string, { min: number; max: number }> = {};
    if (template.subscales) {
      for (const subscale of template.subscales) {
        const method =
          subscale.scoringMethod || template.scoringMethod || "sum";
        let min = 0;
        let max = 0;
        for (const itemNum of subscale.itemNumbers) {
          const item = template.items.find((i) => i.itemNumber === itemNum);
          if (item) {
            const itemMin = Math.min(
              ...item.responseOptions.map((o) => o.value),
            );
            const itemMax = Math.max(
              ...item.responseOptions.map((o) => o.value),
            );
            min += itemMin;
            max += itemMax;
          }
        }
        if (method === "average" || method === "mean") {
          const count = subscale.itemNumbers.length;
          if (count > 0) {
            min = min / count;
            max = max / count;
          }
        }
        subscaleRanges[subscale.name] = { min, max };
      }
    }

    // Determine if this is a clinical instrument (GAD-7, BRS, RAS)
    const clinicalInstruments = ["GAD-7", "BRS", "RAS"];
    const isClinicalInstrument = clinicalInstruments.includes(
      template.shortCode,
    );

    return {
      assignment,
      template: {
        _id: template._id,
        name: template.name,
        shortCode: template.shortCode,
        description: template.description,
        pillar: template.pillar,
        scoringMethod: template.scoringMethod,
        subscaleOnly: template.subscaleOnly,
        subscales: template.subscales,
        severityBands: template.severityBands,
        subscaleSeverityBands: template.subscaleSeverityBands,
        platformDisplayTexts: template.platformDisplayTexts,
        totalScoreRange: template.totalScoreRange,
      },
      score: {
        _id: score._id,
        totalScore: score.totalScore,
        subscaleScores: score.subscaleScores,
        severityBand: score.severityBand,
        flagBehavior: score.flagBehavior,
        interpretation: score.interpretation,
        platformDisplayText: score.platformDisplayText,
        scoredAt: score.scoredAt,
      },
      submittedAt: response?.submittedAt || score.scoredAt,
      session: session
        ? {
            _id: session._id,
            title: session.title,
            pillar: session.pillar,
            sessionNumber: session.sessionNumber,
          }
        : null,
      previousScores,
      subscaleRanges,
      isClinicalInstrument,
    };
  },
});

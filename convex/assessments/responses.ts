import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireUser } from "../authHelpers";
import { createSafeguardingAction } from "../safeguarding";
import { notifyWithEmail } from "../emailHelpers";

export const saveProgress = mutation({
  args: {
    assignmentId: v.id("assessmentAssignments"),
    answers: v.record(v.string(), v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) throw new Error("Assignment not found.");
    if (assignment.userId !== user._id) throw new Error("This is not your assignment.");
    if (assignment.status === "completed") throw new Error("This assessment is already completed.");

    // Update assignment status to in_progress if it was assigned
    if (assignment.status === "assigned") {
      await ctx.db.patch(args.assignmentId, { status: "in_progress", updatedAt: Date.now() });
    }

    // Upsert response
    const existing = await ctx.db
      .query("assessmentResponses")
      .withIndex("by_assignmentId", (q) => q.eq("assignmentId", args.assignmentId))
      .take(1);

    if (existing.length > 0) {
      if (existing[0].isSubmitted) throw new Error("Response already submitted.");
      // Merge answers
      const merged = { ...existing[0].answers, ...args.answers };
      await ctx.db.patch(existing[0]._id, {
        answers: merged,
        updatedAt: Date.now(),
      });
      return existing[0]._id;
    }

    return await ctx.db.insert("assessmentResponses", {
      assignmentId: args.assignmentId,
      userId: user._id,
      templateId: assignment.templateId,
      answers: args.answers,
      isSubmitted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const submit = mutation({
  args: {
    assignmentId: v.id("assessmentAssignments"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) throw new Error("Assignment not found.");
    if (assignment.userId !== user._id) throw new Error("This is not your assignment.");
    if (assignment.status === "completed") throw new Error("Already completed.");

    const response = await ctx.db
      .query("assessmentResponses")
      .withIndex("by_assignmentId", (q) => q.eq("assignmentId", args.assignmentId))
      .take(1);

    if (response.length === 0) throw new Error("No responses saved.");

    const template = await ctx.db.get(assignment.templateId);
    if (!template) throw new Error("Template not found.");

    // Check all items answered
    const answeredCount = Object.keys(response[0].answers).length;
    if (answeredCount < template.items.length) {
      throw new Error(`Please answer all ${template.items.length} questions. You've answered ${answeredCount}.`);
    }

    // Lock response
    await ctx.db.patch(response[0]._id, {
      isSubmitted: true,
      submittedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Mark assignment completed
    await ctx.db.patch(args.assignmentId, {
      status: "completed",
      updatedAt: Date.now(),
    });

    // Score the assessment
    const scoreResult = scoreAssessment(template, response[0].answers);

    const scoreId = await ctx.db.insert("assessmentScores", {
      responseId: response[0]._id,
      assignmentId: args.assignmentId,
      userId: user._id,
      templateId: assignment.templateId,
      totalScore: scoreResult.totalScore,
      subscaleScores: scoreResult.subscaleScores,
      severityBand: scoreResult.severityBand,
      flagBehavior: scoreResult.flagBehavior,
      interpretation: scoreResult.interpretation,
      scoredAt: Date.now(),
    });

    // Send assessment results email
    await notifyWithEmail(ctx, {
      userId: user._id,
      type: "assessment_results",
      title: `Results ready: ${template.name}`,
      body: `Your assessment results for "${template.name}" are now available.`,
      eventKey: `assessment_results:${scoreId}`,
      linkUrl: `/beneficiary/assessments/${args.assignmentId}`,
      emailType: "assessment-results",
      templateData: {
        assessmentName: template.name,
        interpretation: scoreResult.interpretation || "",
      },
    });

    // Auto-create safeguarding action if flagged
    if (
      scoreResult.flagBehavior === "mentor_notify" ||
      scoreResult.flagBehavior === "admin_review"
    ) {
      await createSafeguardingAction(ctx, {
        scoreId,
        userId: user._id,
        flagBehavior: scoreResult.flagBehavior,
      });
    }

    return response[0]._id;
  },
});

export const getByAssignment = query({
  args: { assignmentId: v.id("assessmentAssignments") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) return null;

    if (user.role !== "admin" && assignment.userId !== user._id) {
      throw new Error("Unauthorized.");
    }

    const responses = await ctx.db
      .query("assessmentResponses")
      .withIndex("by_assignmentId", (q) => q.eq("assignmentId", args.assignmentId))
      .take(1);

    return responses[0] || null;
  },
});

// ─── Scoring Engine ───

interface TemplateForScoring {
  items: Array<{
    itemNumber: number;
    isReversed: boolean;
    responseOptions: Array<{ value: number }>;
    subscale?: string;
  }>;
  subscales?: Array<{ name: string; itemNumbers: number[] }>;
  severityBands?: Array<{
    label: string;
    min: number;
    max: number;
    flagBehavior?: "none" | "mentor_notify" | "admin_review";
  }>;
}

function scoreAssessment(
  template: TemplateForScoring,
  answers: Record<string, number>,
) {
  const maxOptionValue = Math.max(
    ...template.items[0]?.responseOptions.map((o) => o.value) || [5],
  );
  const minOptionValue = Math.min(
    ...template.items[0]?.responseOptions.map((o) => o.value) || [1],
  );

  // Calculate item scores with reverse scoring
  let totalScore = 0;
  const itemScores: Record<number, number> = {};

  for (const item of template.items) {
    const rawAnswer = answers[String(item.itemNumber)];
    if (rawAnswer === undefined) continue;

    let score: number;
    if (item.isReversed) {
      score = maxOptionValue + minOptionValue - rawAnswer;
    } else {
      score = rawAnswer;
    }

    itemScores[item.itemNumber] = score;
    totalScore += score;
  }

  // Calculate subscale scores
  const subscaleScores: Record<string, number> = {};
  if (template.subscales) {
    for (const subscale of template.subscales) {
      let subscaleTotal = 0;
      for (const itemNum of subscale.itemNumbers) {
        subscaleTotal += itemScores[itemNum] || 0;
      }
      subscaleScores[subscale.name] = subscaleTotal;
    }
  }

  // Determine severity band
  let severityBand: string | undefined;
  let flagBehavior: "none" | "mentor_notify" | "admin_review" | undefined;
  let interpretation: string | undefined;

  if (template.severityBands) {
    for (const band of template.severityBands) {
      if (totalScore >= band.min && totalScore <= band.max) {
        severityBand = band.label;
        flagBehavior = band.flagBehavior || "none";
        interpretation = `Total score of ${totalScore} falls in the "${band.label}" range (${band.min}–${band.max}).`;
        break;
      }
    }
  }

  if (!interpretation) {
    interpretation = `Total score: ${totalScore}.`;
  }

  return {
    totalScore,
    subscaleScores: Object.keys(subscaleScores).length > 0 ? subscaleScores : undefined,
    severityBand,
    flagBehavior,
    interpretation,
  };
}

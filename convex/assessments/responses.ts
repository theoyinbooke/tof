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
      platformDisplayText: scoreResult.platformDisplayText,
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

/**
 * Flag behavior hierarchy: admin_review > mentor_notify > none.
 * When multiple bands or subscale rules trigger different flags,
 * the engine picks the HIGHEST severity.
 */
const FLAG_PRIORITY: Record<string, number> = {
  none: 0,
  mentor_notify: 1,
  admin_review: 2,
};

type FlagBehavior = "none" | "mentor_notify" | "admin_review";

function higherFlag(a: FlagBehavior | undefined, b: FlagBehavior | undefined): FlagBehavior {
  const pa = FLAG_PRIORITY[a || "none"] ?? 0;
  const pb = FLAG_PRIORITY[b || "none"] ?? 0;
  return pa >= pb ? (a || "none") : (b || "none");
}

interface TemplateForScoring {
  items: Array<{
    itemNumber: number;
    isReversed: boolean;
    responseOptions: Array<{ value: number }>;
    subscale?: string;
  }>;
  subscales?: Array<{
    name: string;
    itemNumbers: number[];
    scoringMethod?: "sum" | "average";
  }>;
  severityBands?: Array<{
    label: string;
    min: number;
    max: number;
    flagBehavior?: FlagBehavior;
  }>;
  subscaleSeverityBands?: Array<{
    subscaleName: string;
    bands: Array<{
      label: string;
      min: number;
      max: number;
      flagBehavior?: FlagBehavior;
    }>;
  }>;
  scoringMethod?: "sum" | "average" | "mean";
  subscaleOnly?: boolean;
  platformDisplayTexts?: Record<string, string>;
  totalScoreRange?: { min: number; max: number };
}

interface ScoreResult {
  totalScore: number | undefined;
  subscaleScores: Record<string, number> | undefined;
  severityBand: string | undefined;
  flagBehavior: FlagBehavior | undefined;
  interpretation: string | undefined;
  platformDisplayText: string | undefined;
}

function scoreAssessment(
  template: TemplateForScoring,
  answers: Record<string, number>,
): ScoreResult {
  // ── Step 1: Compute per-item scores with per-item scale ranges ──
  let sumOfAllItemScores = 0;
  let answeredItemCount = 0;
  const itemScores: Record<number, number> = {};

  for (const item of template.items) {
    const rawAnswer = answers[String(item.itemNumber)];
    if (rawAnswer === undefined) continue;

    // Determine this item's own min and max from its responseOptions
    const itemMax = Math.max(...item.responseOptions.map((o) => o.value));
    const itemMin = Math.min(...item.responseOptions.map((o) => o.value));

    let score: number;
    if (item.isReversed) {
      score = itemMax + itemMin - rawAnswer;
    } else {
      score = rawAnswer;
    }

    itemScores[item.itemNumber] = score;
    sumOfAllItemScores += score;
    answeredItemCount++;
  }

  // ── Step 2: Compute subscale scores ──
  const subscaleScores: Record<string, number> = {};
  if (template.subscales && template.subscales.length > 0) {
    for (const subscale of template.subscales) {
      let subscaleTotal = 0;
      let subscaleCount = 0;
      for (const itemNum of subscale.itemNumbers) {
        if (itemScores[itemNum] !== undefined) {
          subscaleTotal += itemScores[itemNum];
          subscaleCount++;
        }
      }

      // Check if this subscale has its own scoringMethod; otherwise fall back to template's
      const method = subscale.scoringMethod || template.scoringMethod || "sum";
      if ((method === "average" || method === "mean") && subscaleCount > 0) {
        subscaleScores[subscale.name] = subscaleTotal / subscaleCount;
      } else {
        subscaleScores[subscale.name] = subscaleTotal;
      }
    }
  }

  // ── Step 3: Compute total score ──
  let totalScore: number | undefined;
  if (template.subscaleOnly) {
    // No total score for subscale-only instruments (MLQ, AGQ-R)
    totalScore = undefined;
  } else if (
    (template.scoringMethod === "average" || template.scoringMethod === "mean") &&
    answeredItemCount > 0
  ) {
    totalScore = sumOfAllItemScores / answeredItemCount;
  } else {
    totalScore = sumOfAllItemScores;
  }

  // ── Step 4: Determine severity band and flag behavior ──
  let severityBand: string | undefined;
  let flagBehavior: FlagBehavior | undefined;
  let interpretation: string | undefined;

  if (template.subscaleOnly) {
    // For subscale-only instruments, use subscaleSeverityBands
    const result = matchSubscaleSeverity(template, subscaleScores);
    severityBand = result.severityBand;
    flagBehavior = result.flagBehavior;
    interpretation = result.interpretation;
  } else {
    // For normal instruments, match totalScore against severityBands
    if (template.severityBands && totalScore !== undefined) {
      for (const band of template.severityBands) {
        if (totalScore >= band.min && totalScore <= band.max) {
          severityBand = band.label;
          flagBehavior = band.flagBehavior || "none";

          if (template.scoringMethod === "average" || template.scoringMethod === "mean") {
            interpretation = `Score of ${totalScore.toFixed(2)} falls in the "${band.label}" range (${band.min}–${band.max}).`;
          } else {
            interpretation = `Total score of ${totalScore} falls in the "${band.label}" range (${band.min}–${band.max}).`;
          }
          break;
        }
      }
    }

    // Also check subscaleSeverityBands for instruments that have both
    // total-score severity and subscale-level flags (e.g., SWBS RWB < 20)
    if (template.subscaleSeverityBands) {
      for (const ssb of template.subscaleSeverityBands) {
        const ssScore = subscaleScores[ssb.subscaleName];
        if (ssScore === undefined) continue;
        for (const band of ssb.bands) {
          if (ssScore >= band.min && ssScore <= band.max) {
            const bandFlag = band.flagBehavior || "none";
            flagBehavior = higherFlag(flagBehavior, bandFlag);
            // If the subscale band triggers a higher flag, note it in interpretation
            if (
              bandFlag !== "none" &&
              (FLAG_PRIORITY[bandFlag] > FLAG_PRIORITY[flagBehavior || "none"] ||
                flagBehavior === bandFlag)
            ) {
              const subscaleNote = `Subscale "${ssb.subscaleName}" score of ${
                typeof ssScore === "number" && ssScore % 1 !== 0 ? ssScore.toFixed(2) : ssScore
              } falls in "${band.label}" range.`;
              interpretation = interpretation
                ? `${interpretation} ${subscaleNote}`
                : subscaleNote;
            }
            break;
          }
        }
      }
    }

    if (!interpretation && totalScore !== undefined) {
      if (template.scoringMethod === "average" || template.scoringMethod === "mean") {
        interpretation = `Score: ${totalScore.toFixed(2)}.`;
      } else {
        interpretation = `Total score: ${totalScore}.`;
      }
    }
  }

  // ── Step 5: Look up platform display text ──
  let platformDisplayText: string | undefined;
  if (template.platformDisplayTexts && severityBand) {
    platformDisplayText = template.platformDisplayTexts[severityBand];
  }

  return {
    totalScore,
    subscaleScores: Object.keys(subscaleScores).length > 0 ? subscaleScores : undefined,
    severityBand,
    flagBehavior,
    interpretation,
    platformDisplayText,
  };
}

/**
 * Match severity for subscale-only instruments (MLQ, AGQ-R).
 * Uses subscaleSeverityBands to determine bands per subscale,
 * then picks the HIGHEST flag level across all matching bands.
 */
function matchSubscaleSeverity(
  template: TemplateForScoring,
  subscaleScores: Record<string, number>,
): {
  severityBand: string | undefined;
  flagBehavior: FlagBehavior | undefined;
  interpretation: string | undefined;
} {
  const bandLabels: string[] = [];
  let overallFlag: FlagBehavior = "none";
  const interpretationParts: string[] = [];

  if (template.subscaleSeverityBands) {
    for (const ssb of template.subscaleSeverityBands) {
      const ssScore = subscaleScores[ssb.subscaleName];
      if (ssScore === undefined) continue;

      for (const band of ssb.bands) {
        if (ssScore >= band.min && ssScore <= band.max) {
          bandLabels.push(`${band.label} ${ssb.subscaleName}`);
          const bandFlag = band.flagBehavior || "none";
          overallFlag = higherFlag(overallFlag, bandFlag);

          const formattedScore =
            typeof ssScore === "number" && ssScore % 1 !== 0
              ? ssScore.toFixed(2)
              : String(ssScore);
          interpretationParts.push(
            `${ssb.subscaleName}: ${formattedScore} — "${band.label}" (${band.min}–${band.max}).`
          );
          break;
        }
      }
    }
  }

  // Compose composite severity band label
  const severityBand = bandLabels.length > 0 ? bandLabels.join(" / ") : undefined;
  const interpretation =
    interpretationParts.length > 0 ? interpretationParts.join(" ") : undefined;

  return {
    severityBand,
    flagBehavior: overallFlag !== "none" ? overallFlag : undefined,
    interpretation,
  };
}

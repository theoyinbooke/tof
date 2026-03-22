"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { use } from "react";
import Link from "next/link";
import { ScoreGauge } from "@/components/assessments/ScoreGauge";
import { SeverityBadge } from "@/components/assessments/SeverityBadge";
import { SubscaleBar } from "@/components/assessments/SubscaleBar";
import { InterpretationPanel } from "@/components/assessments/InterpretationPanel";
import { GrowthTracking } from "@/components/assessments/GrowthTracking";
import { PrivacyNotice } from "@/components/assessments/PrivacyNotice";

/** Map flagBehavior to a color for the ScoreGauge arc/bar */
function getGaugeColor(
  flagBehavior?: string | null,
  severityBand?: string | null,
): string {
  if (flagBehavior === "admin_review") return "#EF4444";
  if (flagBehavior === "mentor_notify") return "#E65100";

  // Heuristic from band label
  const lower = (severityBand || "").toLowerCase();
  if (lower.includes("severe") || lower.includes("very low")) return "#EF4444";
  if (
    lower.includes("moderate") ||
    lower.includes("mild") ||
    lower.includes("below average")
  )
    return "#F59E0B";

  return "#00D632";
}

export default function AssessmentResultsPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = use(params);
  const id = assignmentId as Id<"assessmentAssignments">;

  const result = useQuery(api.assessments.results.getResultForBeneficiary, {
    assignmentId: id,
  });

  // Loading state
  if (result === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  // No result or not completed
  if (result === null) {
    return (
      <div className="p-6 lg:p-10">
        <Link
          href="/beneficiary/assessments"
          className="text-sm text-[#737373] hover:text-[#171717]"
        >
          &larr; Back to assessments
        </Link>
        <div className="mt-8 text-center">
          <p className="text-sm text-[#737373]">
            Results are not available yet. Please complete the assessment first.
          </p>
        </div>
      </div>
    );
  }

  const { template, score, submittedAt, session, previousScores, subscaleRanges, isClinicalInstrument } = result;

  const scoringMethod = template.scoringMethod || "sum";
  const isSubscaleOnly = template.subscaleOnly === true;
  const isMean = scoringMethod === "mean" || scoringMethod === "average";

  // Determine total score range
  const totalMin = template.totalScoreRange?.min ?? 0;
  const totalMax = template.totalScoreRange?.max ?? 0;

  const gaugeColor = getGaugeColor(score.flagBehavior, score.severityBand);

  // Display text — prefer platformDisplayText, fall back to interpretation
  const displayText =
    score.platformDisplayText || score.interpretation || "";

  return (
    <div className="p-6 lg:p-10">
      <Link
        href="/beneficiary/assessments"
        className="text-sm text-[#737373] hover:text-[#171717]"
      >
        &larr; Back to assessments
      </Link>

      <div className="mx-auto mt-6 max-w-2xl space-y-6">
        {/* ═══════════════════════════════════════════════════
            A. Score Summary Card
           ═══════════════════════════════════════════════════ */}
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-8 items-center justify-center rounded bg-[#F0F0F0] px-2.5 text-[10px] font-bold text-[#525252]">
              {template.shortCode}
            </span>
            <div>
              <h1 className="text-lg font-semibold text-[#171717]">
                {template.name}
              </h1>
              <p className="text-xs text-[#737373]">
                Completed{" "}
                {new Date(submittedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Score visualization */}
          {!isSubscaleOnly && score.totalScore !== undefined && score.totalScore !== null && (
            <div className="mt-6 flex flex-col items-center">
              <ScoreGauge
                score={score.totalScore}
                min={totalMin}
                max={totalMax}
                label="Your Score"
                type={isMean ? "radial" : "bar"}
                color={gaugeColor}
              />
            </div>
          )}

          {isSubscaleOnly && (
            <div className="mt-6 text-center">
              <p className="text-sm font-medium text-[#737373]">
                Your Profile
              </p>
            </div>
          )}

          {/* Severity badge */}
          {score.severityBand && (
            <div className="mt-4 flex justify-center">
              <SeverityBadge
                band={score.severityBand}
                flagBehavior={score.flagBehavior ?? undefined}
              />
            </div>
          )}

          {/* Platform display text (brief version) */}
          {displayText && (
            <p className="mt-4 text-center text-sm leading-relaxed text-[#262626]">
              {displayText}
            </p>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════
            B. Subscale Breakdown
           ═══════════════════════════════════════════════════ */}
        {score.subscaleScores &&
          Object.keys(score.subscaleScores).length > 0 && (
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
              <h3 className="text-sm font-semibold text-[#171717]">
                {isSubscaleOnly ? "Your Scores" : "Subscale Breakdown"}
              </h3>
              <div className="mt-4 space-y-4">
                {Object.entries(score.subscaleScores).map(
                  ([name, value]) => {
                    const range = subscaleRanges[name] || {
                      min: 0,
                      max: 100,
                    };
                    return (
                      <SubscaleBar
                        key={name}
                        name={name}
                        score={value}
                        min={range.min}
                        max={range.max}
                      />
                    );
                  },
                )}
              </div>
            </div>
          )}

        {/* ═══════════════════════════════════════════════════
            C. Interpretation Panel
           ═══════════════════════════════════════════════════ */}
        <InterpretationPanel
          displayText={displayText}
          instrumentName={template.name}
          isClinicalInstrument={isClinicalInstrument}
          sessionTitle={session?.title}
          sessionPillar={session?.pillar}
        />

        {/* ═══════════════════════════════════════════════════
            D. Growth Tracking
           ═══════════════════════════════════════════════════ */}
        {previousScores.length > 0 && (
          <GrowthTracking
            currentScore={{
              totalScore: score.totalScore ?? undefined,
              subscaleScores: score.subscaleScores ?? undefined,
              severityBand: score.severityBand ?? undefined,
              scoredAt: score.scoredAt,
            }}
            previousScores={previousScores.map((s) => ({
              totalScore: s.totalScore ?? undefined,
              subscaleScores: s.subscaleScores ?? undefined,
              severityBand: s.severityBand ?? undefined,
              scoredAt: s.scoredAt,
            }))}
            instrumentName={template.shortCode}
            subscaleOnly={isSubscaleOnly}
          />
        )}

        {/* ═══════════════════════════════════════════════════
            E. Privacy Notice
           ═══════════════════════════════════════════════════ */}
        <PrivacyNotice />
      </div>
    </div>
  );
}

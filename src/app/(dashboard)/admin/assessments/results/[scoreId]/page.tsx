"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { use, useState } from "react";
import Link from "next/link";

const SEVERITY_BADGE_COLORS: Record<string, string> = {
  "Minimal": "bg-[#E6FBF0] text-[#00D632]",
  "Minimal anxiety": "bg-[#E6FBF0] text-[#00D632]",
  "High": "bg-[#E6FBF0] text-[#00D632]",
  "High resilience": "bg-[#E6FBF0] text-[#00D632]",
  "High grit": "bg-[#E6FBF0] text-[#00D632]",
  "High self-efficacy": "bg-[#E6FBF0] text-[#00D632]",
  "Normal": "bg-[#E6FBF0] text-[#00D632]",
  "Healthy": "bg-[#E6FBF0] text-[#00D632]",
  "Positive": "bg-[#E6FBF0] text-[#00D632]",
  "Mild": "bg-yellow-50 text-yellow-600",
  "Mild anxiety": "bg-yellow-50 text-yellow-600",
  "Moderate": "bg-yellow-50 text-yellow-600",
  "Average": "bg-yellow-50 text-yellow-600",
  "Below Average": "bg-yellow-50 text-yellow-600",
  "Moderately severe": "bg-orange-50 text-orange-600",
  "Low": "bg-orange-50 text-orange-600",
  "Low resilience": "bg-orange-50 text-orange-600",
  "Severe": "bg-red-50 text-red-600",
  "Severe anxiety": "bg-red-50 text-red-600",
  "Very Low": "bg-red-50 text-red-600",
  "Critical": "bg-red-50 text-red-600",
};

const FLAG_BADGE_STYLES: Record<string, string> = {
  mentor_notify: "bg-yellow-50 text-yellow-600",
  admin_review: "bg-red-50 text-red-600",
  none: "bg-[#F0F0F0] text-[#737373]",
};

const SAFEGUARDING_STATUS_COLORS: Record<string, string> = {
  open: "bg-red-50 text-red-600",
  in_progress: "bg-yellow-50 text-yellow-600",
  resolved: "bg-[#E6FBF0] text-[#00D632]",
  dismissed: "bg-[#F0F0F0] text-[#737373]",
};

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSeverityBadgeColor(band: string | undefined): string {
  if (!band) return "bg-[#F0F0F0] text-[#737373]";
  return SEVERITY_BADGE_COLORS[band] || "bg-[#F0F0F0] text-[#737373]";
}

export default function AdminScoreDetailPage({
  params,
}: {
  params: Promise<{ scoreId: string }>;
}) {
  const { scoreId } = use(params);
  const id = scoreId as Id<"assessmentScores">;
  const detail = useQuery(api.assessments.scoring.getScoreDetail, {
    scoreId: id,
  });

  const [showRawAnswers, setShowRawAnswers] = useState(false);

  if (detail === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="p-6 lg:p-10">
        <Link href="/admin/assessments" className="text-sm text-[#737373]">
          &larr; Back
        </Link>
        <p className="mt-8 text-center text-sm text-[#737373]">
          Score not found.
        </p>
      </div>
    );
  }

  const { score, template, user, response, assignment, session, otherScores, safeguardingAction } =
    detail;

  // Compute per-item scoring audit
  const itemAudit: Array<{
    itemNumber: number;
    text: string;
    subscale?: string;
    isReversed: boolean;
    rawAnswer: number | undefined;
    scoredValue: number;
  }> = [];

  if (template && response) {
    for (const item of template.items) {
      const rawAnswer = response.answers[String(item.itemNumber)];
      let scoredValue = rawAnswer ?? 0;
      if (item.isReversed && rawAnswer !== undefined) {
        const itemMax = Math.max(...item.responseOptions.map((o) => o.value));
        const itemMin = Math.min(...item.responseOptions.map((o) => o.value));
        scoredValue = itemMax + itemMin - rawAnswer;
      }
      itemAudit.push({
        itemNumber: item.itemNumber,
        text: item.text,
        subscale: item.subscale,
        isReversed: item.isReversed,
        rawAnswer,
        scoredValue,
      });
    }
  }

  return (
    <div className="p-6 lg:p-10">
      <Link
        href="/admin/assessments"
        className="text-sm text-[#737373] hover:text-[#171717]"
      >
        &larr; Back to assessments
      </Link>

      {/* Header */}
      <div className="mt-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-[#171717]">
            {user?.name || "Unknown Beneficiary"}
          </h1>
          {score.flagBehavior && score.flagBehavior !== "none" && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                FLAG_BADGE_STYLES[score.flagBehavior] ||
                "bg-[#F0F0F0] text-[#737373]"
              }`}
            >
              {score.flagBehavior.replace("_", " ")}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-[#737373]">
          {template?.name || "Unknown"} ({template?.shortCode || "?"})
          {session
            ? ` · Session ${session.sessionNumber}: ${session.title}`
            : ""}
          {" · Scored "}
          {formatDateTime(score.scoredAt)}
        </p>
      </div>

      {/* Score Summary + Flag Status */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Score Summary Card */}
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">
            Score Summary
          </h2>
          <div className="mt-4 space-y-3">
            {score.totalScore !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#737373]">Total Score</span>
                <span className="text-2xl font-semibold text-[#171717]">
                  {typeof score.totalScore === "number" &&
                  score.totalScore % 1 !== 0
                    ? score.totalScore.toFixed(2)
                    : score.totalScore}
                  {template?.totalScoreRange && (
                    <span className="ml-1 text-sm font-normal text-[#737373]">
                      / {template.totalScoreRange.max}
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* Score bar */}
            {score.totalScore !== undefined && template?.totalScoreRange && (
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-[#F0F0F0]">
                {template.severityBands && template.severityBands.length > 0 ? (
                  // Color the bar by severity bands
                  <div className="flex h-full">
                    {template.severityBands.map((band) => {
                      const range =
                        template.totalScoreRange!.max -
                        template.totalScoreRange!.min;
                      const width =
                        range > 0
                          ? ((band.max - band.min + 1) / (range + 1)) * 100
                          : 0;
                      const bandColor =
                        band.flagBehavior === "admin_review"
                          ? "bg-[#EF4444]"
                          : band.flagBehavior === "mentor_notify"
                            ? "bg-[#E65100]"
                            : band.label
                                .toLowerCase()
                                .includes("mild") ||
                                band.label
                                  .toLowerCase()
                                  .includes("moderate") ||
                                band.label.toLowerCase().includes("average")
                              ? "bg-[#F59E0B]"
                              : "bg-[#00D632]";
                      return (
                        <div
                          key={band.label}
                          className={`${bandColor} h-full opacity-60`}
                          style={{ width: `${width}%` }}
                          title={`${band.label}: ${band.min}-${band.max}`}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div
                    className="h-full rounded-full bg-[#00D632]"
                    style={{
                      width: `${Math.min(
                        ((score.totalScore - template.totalScoreRange.min) /
                          (template.totalScoreRange.max -
                            template.totalScoreRange.min)) *
                          100,
                        100,
                      )}%`,
                    }}
                  />
                )}
                {/* Score marker */}
                {template.totalScoreRange && (
                  <div
                    className="absolute top-0 h-full w-0.5 bg-[#171717]"
                    style={{
                      left: `${Math.min(
                        ((score.totalScore -
                          template.totalScoreRange.min) /
                          (template.totalScoreRange.max -
                            template.totalScoreRange.min)) *
                          100,
                        100,
                      )}%`,
                    }}
                  />
                )}
              </div>
            )}

            {score.severityBand && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#737373]">Severity Band</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getSeverityBadgeColor(score.severityBand)}`}
                >
                  {score.severityBand}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-[#737373]">Scoring Method</span>
              <span className="text-sm text-[#171717]">
                {template?.scoringMethod || "sum"}
              </span>
            </div>

            {score.interpretation && (
              <div className="mt-2 rounded-lg bg-[#F7F7F7] p-3">
                <p className="text-xs text-[#525252]">
                  {score.interpretation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Flag / Safeguarding Status Card */}
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">
            Flag &amp; Safeguarding
          </h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#737373]">Flag Level</span>
              {score.flagBehavior && score.flagBehavior !== "none" ? (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    FLAG_BADGE_STYLES[score.flagBehavior] ||
                    "bg-[#F0F0F0] text-[#737373]"
                  }`}
                >
                  {score.flagBehavior.replace("_", " ")}
                </span>
              ) : (
                <span className="text-sm text-[#00D632]">None</span>
              )}
            </div>

            {safeguardingAction ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#737373]">
                    Safeguarding Status
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      SAFEGUARDING_STATUS_COLORS[
                        safeguardingAction.status
                      ] || "bg-[#F0F0F0] text-[#737373]"
                    }`}
                  >
                    {safeguardingAction.status.replace("_", " ")}
                  </span>
                </div>
                {safeguardingAction.recommendedAction && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm text-[#737373]">
                      Recommended Action
                    </span>
                    <span className="text-right text-sm text-[#171717]">
                      {safeguardingAction.recommendedAction}
                    </span>
                  </div>
                )}
                {safeguardingAction.resolutionNote && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm text-[#737373]">
                      Resolution Note
                    </span>
                    <span className="text-right text-sm text-[#171717]">
                      {safeguardingAction.resolutionNote}
                    </span>
                  </div>
                )}
                <div className="mt-2">
                  <Link
                    href="/admin/safeguarding"
                    className="text-xs font-medium text-[#00D632] hover:underline"
                  >
                    View in Safeguarding &rarr;
                  </Link>
                </div>
              </>
            ) : (
              <div className="rounded-lg bg-[#F7F7F7] p-3">
                <p className="text-xs text-[#737373]">
                  {score.flagBehavior && score.flagBehavior !== "none"
                    ? "A safeguarding action should be created for this score."
                    : "No safeguarding action required."}
                </p>
                {score.flagBehavior && score.flagBehavior !== "none" && (
                  <Link
                    href="/admin/safeguarding"
                    className="mt-2 inline-block text-xs font-medium text-[#00D632] hover:underline"
                  >
                    Go to Safeguarding &rarr;
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subscale Scores */}
      {score.subscaleScores &&
        Object.keys(score.subscaleScores).length > 0 && (
          <div className="mt-6 rounded-xl border border-[#E5E5E5] bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">
              Subscale Scores
            </h2>
            <div className="mt-4 space-y-3">
              {Object.entries(score.subscaleScores).map(
                ([subscaleName, subscaleScore]) => {
                  // Find the subscale definition for item count
                  const subscaleDef = template?.subscales?.find(
                    (s) => s.name === subscaleName,
                  );
                  const itemCount = subscaleDef?.itemNumbers.length || 0;
                  // Try to get a reasonable max for display
                  const scoringMethod =
                    template?.scoringMethod || "sum";
                  const isAvg =
                    scoringMethod === "average" || scoringMethod === "mean";
                  // For average scored, max is typically 5; for sum, max is itemCount * maxOption
                  let maxVal = isAvg ? 5 : itemCount * 5;
                  if (template?.totalScoreRange) {
                    // Rough estimate for subscale range
                    maxVal = isAvg
                      ? 5
                      : Math.round(
                          (template.totalScoreRange.max *
                            itemCount) /
                            template.items.length,
                        );
                  }

                  const pct =
                    maxVal > 0
                      ? Math.min((subscaleScore / maxVal) * 100, 100)
                      : 0;

                  return (
                    <div key={subscaleName}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#262626]">
                          {subscaleName}
                        </span>
                        <span className="text-sm font-medium text-[#171717]">
                          {typeof subscaleScore === "number" &&
                          subscaleScore % 1 !== 0
                            ? subscaleScore.toFixed(2)
                            : subscaleScore}
                          {itemCount > 0 && (
                            <span className="ml-1 text-xs text-[#737373]">
                              ({itemCount} items)
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[#F0F0F0]">
                        <div
                          className="h-full rounded-full bg-[#00D632]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}

      {/* Raw Answers / Scoring Audit */}
      {response && template && (
        <div className="mt-6 rounded-xl border border-[#E5E5E5] bg-white">
          <button
            onClick={() => setShowRawAnswers(!showRawAnswers)}
            className="flex w-full items-center justify-between px-6 py-4 text-left"
          >
            <h2 className="text-sm font-semibold text-[#171717]">
              Scoring Details &amp; Raw Answers
            </h2>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="#737373"
              strokeWidth="1.5"
              strokeLinecap="round"
              className={`transition-transform ${showRawAnswers ? "rotate-180" : ""}`}
            >
              <path d="M3 5l4 4 4-4" />
            </svg>
          </button>

          {showRawAnswers && (
            <div className="border-t border-[#F0F0F0] px-6 pb-6 pt-4">
              {/* Scoring meta */}
              <div className="mb-4 space-y-1">
                <p className="text-xs text-[#737373]">
                  <span className="font-medium text-[#525252]">
                    Scoring method:
                  </span>{" "}
                  {template.scoringMethod || "sum"}
                </p>
                <p className="text-xs text-[#737373]">
                  <span className="font-medium text-[#525252]">
                    Items answered:
                  </span>{" "}
                  {Object.keys(response.answers).length} /{" "}
                  {template.items.length}
                </p>
                <p className="text-xs text-[#737373]">
                  <span className="font-medium text-[#525252]">
                    Reversed items:
                  </span>{" "}
                  {template.items.filter((i) => i.isReversed).length > 0
                    ? template.items
                        .filter((i) => i.isReversed)
                        .map((i) => `Q${i.itemNumber}`)
                        .join(", ")
                    : "None"}
                </p>
                {response.submittedAt && (
                  <p className="text-xs text-[#737373]">
                    <span className="font-medium text-[#525252]">
                      Submitted:
                    </span>{" "}
                    {formatDateTime(response.submittedAt)}
                  </p>
                )}
              </div>

              {/* Item-by-item table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#F0F0F0] text-left text-[10px] font-medium uppercase tracking-wider text-[#737373]">
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Item Text</th>
                      <th className="px-3 py-2">Raw</th>
                      <th className="px-3 py-2">Reversed?</th>
                      <th className="px-3 py-2">Scored</th>
                      <th className="px-3 py-2">Subscale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemAudit.map((item) => (
                      <tr
                        key={item.itemNumber}
                        className={`border-b border-[#F0F0F0] last:border-0 ${
                          item.isReversed ? "bg-yellow-50/30" : ""
                        }`}
                      >
                        <td className="px-3 py-2 text-xs font-bold text-[#737373]">
                          {item.itemNumber}
                        </td>
                        <td className="max-w-[300px] px-3 py-2 text-xs text-[#262626]">
                          <span className="line-clamp-2">{item.text}</span>
                        </td>
                        <td className="px-3 py-2 text-xs font-medium text-[#171717]">
                          {item.rawAnswer ?? "\u2014"}
                        </td>
                        <td className="px-3 py-2">
                          {item.isReversed ? (
                            <span className="rounded bg-yellow-50 px-1.5 py-0.5 text-[9px] font-medium text-yellow-600">
                              Yes
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#D4D4D4]">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs font-medium text-[#171717]">
                          {item.scoredValue}
                          {item.isReversed &&
                            item.rawAnswer !== undefined && (
                              <span className="ml-1 text-[9px] text-[#737373]">
                                ({item.rawAnswer}&rarr;{item.scoredValue})
                              </span>
                            )}
                        </td>
                        <td className="px-3 py-2">
                          {item.subscale ? (
                            <span className="rounded bg-[#F0F0F0] px-1.5 py-0.5 text-[9px] text-[#737373]">
                              {item.subscale}
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#D4D4D4]">
                              \u2014
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cross-References: Other Scores for this Beneficiary */}
      {otherScores && otherScores.length > 0 && (
        <div className="mt-6 rounded-xl border border-[#E5E5E5] bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">
            Other Scores for {user?.name || "this beneficiary"}
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F0F0F0] text-left text-xs font-medium uppercase tracking-wider text-[#737373]">
                  <th className="px-3 py-2">Instrument</th>
                  <th className="px-3 py-2">Session</th>
                  <th className="px-3 py-2">Score</th>
                  <th className="px-3 py-2">Band</th>
                  <th className="px-3 py-2">Flag</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {otherScores.map((s) => (
                  <tr
                    key={s._id}
                    className="border-b border-[#F0F0F0] last:border-0"
                  >
                    <td className="px-3 py-2">
                      <span className="rounded bg-[#F0F0F0] px-2 py-0.5 text-[10px] font-bold text-[#525252]">
                        {s.templateShortCode}
                      </span>
                      <span className="ml-1.5 text-xs text-[#737373]">
                        {s.templateName}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-[#737373]">
                      {s.sessionNumber ? `S${s.sessionNumber}` : "\u2014"}
                    </td>
                    <td className="px-3 py-2 text-xs font-medium text-[#171717]">
                      {s.totalScore !== undefined
                        ? typeof s.totalScore === "number" &&
                          s.totalScore % 1 !== 0
                          ? s.totalScore.toFixed(2)
                          : s.totalScore
                        : s.subscaleScores
                          ? Object.entries(s.subscaleScores)
                              .map(
                                ([k, v]) =>
                                  `${k}: ${typeof v === "number" && v % 1 !== 0 ? v.toFixed(1) : v}`,
                              )
                              .join(", ")
                          : "\u2014"}
                    </td>
                    <td className="px-3 py-2">
                      {s.severityBand ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getSeverityBadgeColor(s.severityBand)}`}
                        >
                          {s.severityBand}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#D4D4D4]">
                          \u2014
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {s.flagBehavior && s.flagBehavior !== "none" ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            FLAG_BADGE_STYLES[s.flagBehavior] ||
                            "bg-[#F0F0F0] text-[#737373]"
                          }`}
                        >
                          {s.flagBehavior.replace("_", " ")}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#D4D4D4]">
                          \u2014
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs text-[#737373]">
                      {formatDate(s.scoredAt)}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/assessments/results/${s._id}`}
                        className="text-xs font-medium text-[#00D632] hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useState } from "react";

type FlagFilter = "all" | "mentor_notify" | "admin_review";

const FLAG_BADGE_STYLES: Record<string, string> = {
  mentor_notify: "bg-yellow-50 text-yellow-600",
  admin_review: "bg-red-50 text-red-600",
};

const SEVERITY_BADGE_COLORS: Record<string, string> = {
  // Green bands
  "Minimal": "bg-[#E6FBF0] text-[#00D632]",
  "Minimal anxiety": "bg-[#E6FBF0] text-[#00D632]",
  "No anxiety": "bg-[#E6FBF0] text-[#00D632]",
  "High": "bg-[#E6FBF0] text-[#00D632]",
  "High resilience": "bg-[#E6FBF0] text-[#00D632]",
  "High grit": "bg-[#E6FBF0] text-[#00D632]",
  "Normal": "bg-[#E6FBF0] text-[#00D632]",
  "Healthy": "bg-[#E6FBF0] text-[#00D632]",
  "Positive": "bg-[#E6FBF0] text-[#00D632]",
  // Amber bands
  "Mild": "bg-yellow-50 text-yellow-600",
  "Mild anxiety": "bg-yellow-50 text-yellow-600",
  "Moderate": "bg-yellow-50 text-yellow-600",
  "Average": "bg-yellow-50 text-yellow-600",
  "Below Average": "bg-yellow-50 text-yellow-600",
  // Orange bands
  "Moderately severe": "bg-orange-50 text-orange-600",
  "Low": "bg-orange-50 text-orange-600",
  "Low resilience": "bg-orange-50 text-orange-600",
  // Red bands
  "Severe": "bg-red-50 text-red-600",
  "Severe anxiety": "bg-red-50 text-red-600",
  "Very Low": "bg-red-50 text-red-600",
  "Critical": "bg-red-50 text-red-600",
};

const SAFEGUARDING_STATUS_COLORS: Record<string, string> = {
  open: "bg-red-50 text-red-600",
  in_progress: "bg-yellow-50 text-yellow-600",
  resolved: "bg-[#E6FBF0] text-[#00D632]",
  dismissed: "bg-[#F0F0F0] text-[#737373]",
};

function getSeverityBadgeColor(band: string | undefined): string {
  if (!band) return "bg-[#F0F0F0] text-[#737373]";
  return SEVERITY_BADGE_COLORS[band] || "bg-[#F0F0F0] text-[#737373]";
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function FlaggedScoresPanel() {
  const [flagFilter, setFlagFilter] = useState<FlagFilter>("all");

  const flagged = useQuery(
    api.assessments.scoring.listFlaggedScores,
    flagFilter === "all" ? {} : { flagFilter },
  );

  if (flagged === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Flag counts summary */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#737373]">
            {flagged.length} flagged score{flagged.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2">
        {(["all", "admin_review", "mentor_notify"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFlagFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              flagFilter === f
                ? "bg-[#171717] text-white"
                : "bg-[#F0F0F0] text-[#525252] hover:bg-[#E5E5E5]"
            }`}
          >
            {f === "all"
              ? "All"
              : f === "admin_review"
                ? "Admin Review"
                : "Mentor Notify"}
          </button>
        ))}
      </div>

      {/* Flagged scores table */}
      {flagged.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E6FBF0]">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="#00D632"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M4 10l4 4 8-8" />
            </svg>
          </div>
          <h2 className="mt-3 text-base font-semibold text-[#171717]">
            No flagged scores
          </h2>
          <p className="mt-1 text-sm text-[#737373]">
            All assessment scores are within expected ranges.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F0F0F0] text-left text-xs font-medium uppercase tracking-wider text-[#737373]">
                  <th className="px-4 py-3">Beneficiary</th>
                  <th className="px-4 py-3">Instrument</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Flag Level</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Safeguarding</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {flagged.map((score) => (
                  <tr
                    key={score._id}
                    className={`border-b border-[#F0F0F0] last:border-0 ${
                      score.flagBehavior === "admin_review"
                        ? "border-l-4 border-l-[#EF4444]"
                        : "border-l-4 border-l-[#F59E0B]"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-[#171717]">
                        {score.userName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-[#F0F0F0] px-2 py-0.5 text-[10px] font-bold text-[#525252]">
                        {score.templateShortCode}
                      </span>
                      <span className="ml-1.5 text-xs text-[#737373]">
                        {score.templateName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-[#171717]">
                      {score.totalScore !== undefined
                        ? typeof score.totalScore === "number" &&
                          score.totalScore % 1 !== 0
                          ? score.totalScore.toFixed(2)
                          : score.totalScore
                        : score.subscaleScores
                          ? Object.entries(score.subscaleScores)
                              .map(
                                ([k, v]) =>
                                  `${k}: ${typeof v === "number" && v % 1 !== 0 ? v.toFixed(1) : v}`,
                              )
                              .join(", ")
                          : "\u2014"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getSeverityBadgeColor(score.severityBand)}`}
                      >
                        {score.severityBand || "Unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${FLAG_BADGE_STYLES[score.flagBehavior || ""] || "bg-[#F0F0F0] text-[#737373]"}`}
                      >
                        {score.flagBehavior === "admin_review"
                          ? "admin review"
                          : "mentor notify"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#737373]">
                      {formatDate(score.scoredAt)}
                    </td>
                    <td className="px-4 py-3">
                      {score.safeguardingAction ? (
                        <Link
                          href="/admin/safeguarding"
                          className="inline-flex items-center gap-1"
                        >
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              SAFEGUARDING_STATUS_COLORS[
                                score.safeguardingAction.status
                              ] || "bg-[#F0F0F0] text-[#737373]"
                            }`}
                          >
                            {score.safeguardingAction.status.replace("_", " ")}
                          </span>
                        </Link>
                      ) : (
                        <span className="text-[10px] text-[#D4D4D4]">
                          None
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/assessments/results/${score._id}`}
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

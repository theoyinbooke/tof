"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const BAND_COLORS: Record<string, string> = {
  // Green-ish bands
  "Minimal": "bg-[#00D632]",
  "Minimal anxiety": "bg-[#00D632]",
  "No anxiety": "bg-[#00D632]",
  "High": "bg-[#00D632]",
  "High resilience": "bg-[#00D632]",
  "High grit": "bg-[#00D632]",
  "High self-efficacy": "bg-[#00D632]",
  "Positive": "bg-[#00D632]",
  "Normal": "bg-[#00D632]",
  "Healthy": "bg-[#00D632]",
  // Amber/moderate bands
  "Mild": "bg-[#F59E0B]",
  "Mild anxiety": "bg-[#F59E0B]",
  "Moderate": "bg-[#F59E0B]",
  "Average": "bg-[#F59E0B]",
  "Below Average": "bg-[#F59E0B]",
  // Orange bands
  "Moderately severe": "bg-[#E65100]",
  "Low": "bg-[#E65100]",
  "Low resilience": "bg-[#E65100]",
  // Red/severe bands
  "Severe": "bg-[#EF4444]",
  "Severe anxiety": "bg-[#EF4444]",
  "Very Low": "bg-[#EF4444]",
  "Critical": "bg-[#EF4444]",
};

function getBandColor(bandLabel: string): string {
  return BAND_COLORS[bandLabel] || "bg-[#D4D4D4]";
}

export default function CohortAssessmentOverview() {
  const overview = useQuery(api.assessments.scoring.getCohortOverview, {});

  if (overview === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  const {
    totalCompleted,
    totalAssigned,
    avgCompletionRate,
    totalFlagged,
    templateStats,
    pillarGroups,
  } = overview;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total Completed"
          value={totalCompleted}
          subtext={`of ${totalAssigned} assigned`}
          accent="border-l-[#00D632]"
        />
        <SummaryCard
          label="Completion Rate"
          value={`${Math.round(avgCompletionRate * 100)}%`}
          subtext="across all instruments"
          accent="border-l-[#3B82F6]"
        />
        <SummaryCard
          label="Flagged Scores"
          value={totalFlagged}
          subtext="needing attention"
          accent="border-l-[#EF4444]"
        />
        <SummaryCard
          label="Instruments"
          value={templateStats.length}
          subtext="published"
          accent="border-l-[#F59E0B]"
        />
      </div>

      {/* Per-Instrument Distribution Table */}
      <div className="rounded-xl border border-[#E5E5E5] bg-white">
        <div className="border-b border-[#F0F0F0] px-6 py-4">
          <h2 className="text-sm font-semibold text-[#171717]">
            Instrument Overview
          </h2>
          <p className="mt-0.5 text-xs text-[#737373]">
            Score distribution across severity bands for each instrument.
          </p>
        </div>

        {templateStats.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-[#737373]">
              No published instruments with scores yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F0F0F0] text-left text-xs font-medium uppercase tracking-wider text-[#737373]">
                  <th className="px-6 py-3">Instrument</th>
                  <th className="px-4 py-3">Session</th>
                  <th className="px-4 py-3">Completed</th>
                  <th className="px-4 py-3">Avg Score</th>
                  <th className="px-4 py-3 min-w-[200px]">Distribution</th>
                  <th className="px-4 py-3">Flagged</th>
                </tr>
              </thead>
              <tbody>
                {templateStats.map((stat) => {
                  const totalInBands = Object.values(
                    stat.bandDistribution,
                  ).reduce((a, b) => a + b, 0);

                  return (
                    <tr
                      key={stat.templateId}
                      className="border-b border-[#F0F0F0] last:border-0"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-10 items-center justify-center rounded bg-[#F0F0F0] text-[9px] font-bold text-[#525252]">
                            {stat.shortCode}
                          </span>
                          <span className="text-sm font-medium text-[#171717]">
                            {stat.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#737373]">
                        {stat.sessionNumber
                          ? `S${stat.sessionNumber}`
                          : "\u2014"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-[#171717]">
                          {stat.totalCompleted}
                        </span>
                        <span className="text-xs text-[#737373]">
                          {" "}
                          / {stat.totalAssigned}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#171717]">
                        {stat.avgScore !== undefined
                          ? stat.scoringMethod === "average" ||
                            stat.scoringMethod === "mean"
                            ? stat.avgScore.toFixed(2)
                            : Math.round(stat.avgScore)
                          : "\u2014"}
                        {stat.totalScoreRange && (
                          <span className="ml-1 text-xs text-[#737373]">
                            / {stat.totalScoreRange.max}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {totalInBands > 0 ? (
                          <div className="flex h-5 w-full overflow-hidden rounded-full bg-[#F0F0F0]">
                            {Object.entries(stat.bandDistribution).map(
                              ([band, count]) => {
                                const pct = (count / totalInBands) * 100;
                                if (pct === 0) return null;
                                return (
                                  <div
                                    key={band}
                                    className={`${getBandColor(band)} relative`}
                                    style={{ width: `${pct}%` }}
                                    title={`${band}: ${count} (${Math.round(pct)}%)`}
                                  />
                                );
                              },
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-[#D4D4D4]">
                            No data
                          </span>
                        )}
                        {totalInBands > 0 && (
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                            {Object.entries(stat.bandDistribution).map(
                              ([band, count]) => (
                                <span
                                  key={band}
                                  className="text-[10px] text-[#737373]"
                                >
                                  <span
                                    className={`mr-1 inline-block h-2 w-2 rounded-full ${getBandColor(band)}`}
                                  />
                                  {band}: {count}
                                </span>
                              ),
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {stat.totalFlagged > 0 ? (
                          <div className="flex items-center gap-1">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-50 text-[10px] font-bold text-red-600">
                              {stat.totalFlagged}
                            </span>
                            {stat.adminReviewCount > 0 && (
                              <span className="text-[10px] text-red-500">
                                {stat.adminReviewCount} admin
                              </span>
                            )}
                            {stat.mentorNotifyCount > 0 && (
                              <span className="text-[10px] text-[#F59E0B]">
                                {stat.mentorNotifyCount} mentor
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-[#D4D4D4]">\u2014</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pillar Progress */}
      <div className="rounded-xl border border-[#E5E5E5] bg-white">
        <div className="border-b border-[#F0F0F0] px-6 py-4">
          <h2 className="text-sm font-semibold text-[#171717]">
            Pillar Progress
          </h2>
          <p className="mt-0.5 text-xs text-[#737373]">
            Aggregate averages grouped by programme pillar.
          </p>
        </div>
        <div className="p-6">
          {Object.keys(pillarGroups).length === 0 ? (
            <p className="text-sm text-[#737373]">No data yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.values(pillarGroups).map((group) => (
                <div
                  key={group.pillar}
                  className="rounded-lg border border-[#F0F0F0] p-4"
                >
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                    {group.pillar.replace(/_/g, " ")}
                  </h3>
                  <div className="mt-3 space-y-2">
                    {group.templates.map((t) => (
                      <div
                        key={t.templateId}
                        className="flex items-center justify-between"
                      >
                        <span className="text-xs text-[#262626]">
                          {t.shortCode}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#F0F0F0]">
                            <div
                              className="h-full rounded-full bg-[#00D632]"
                              style={{
                                width: `${Math.min(t.completionRate * 100, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-[#737373]">
                            {Math.round(t.completionRate * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {group.avgScore !== undefined && (
                    <p className="mt-3 border-t border-[#F0F0F0] pt-2 text-xs text-[#737373]">
                      Pillar avg:{" "}
                      <span className="font-medium text-[#171717]">
                        {group.avgScore.toFixed(1)}
                      </span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  subtext,
  accent,
}: {
  label: string;
  value: string | number;
  subtext: string;
  accent: string;
}) {
  return (
    <div
      className={`rounded-xl border border-[#E5E5E5] bg-white p-5 border-l-4 ${accent}`}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-[#171717]">{value}</p>
      <p className="mt-0.5 text-xs text-[#737373]">{subtext}</p>
    </div>
  );
}

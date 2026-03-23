"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { KPICard } from "./KPICard";
import { ChartCard } from "./ChartCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const CHART_PALETTE = [
  "#00D632",
  "#3B82F6",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#E65100",
  "#06B6D4",
];

const BAND_COLORS: Record<string, string> = {
  Minimal: "#00D632",
  Mild: "#3B82F6",
  Low: "#3B82F6",
  Normal: "#00D632",
  Moderate: "#F59E0B",
  "Moderately Severe": "#E65100",
  High: "#E65100",
  Severe: "#EF4444",
  "Very High": "#EF4444",
  Unscored: "#737373",
};

const SAFEGUARDING_COLORS: Record<string, string> = {
  open: "#EF4444",
  in_progress: "#F59E0B",
  resolved: "#00D632",
  dismissed: "#737373",
};

export function AssessmentsTab() {
  const data = useQuery(api.reportAnalytics.assessmentMetrics);

  if (data === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  // Build unified trend data for multi-line chart
  const allMonths = new Set<string>();
  for (const trend of data.scoreTrends) {
    for (const point of trend.points) {
      allMonths.add(point.month);
    }
  }
  const sortedMonths = Array.from(allMonths).sort();

  const trendChartData = sortedMonths.map((month) => {
    const point: Record<string, string | number> = {
      month: new Date(month + "-01").toLocaleDateString("en-GB", {
        month: "short",
        year: "2-digit",
      }),
    };
    for (const trend of data.scoreTrends) {
      const match = trend.points.find((p: { month: string; avgScore: number }) => p.month === month);
      if (match) {
        point[trend.shortCode] = match.avgScore;
      }
    }
    return point;
  });

  const safeguardingChartData = data.safeguardingByStatus.map((s: { status: string; count: number }) => ({
    name: s.status
      .replace("_", " ")
      .replace(/\b\w/g, (c: string) => c.toUpperCase()),
    value: s.count,
    fill: SAFEGUARDING_COLORS[s.status] || "#737373",
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Scores Recorded"
          value={data.totalScored}
          subtext="total assessment scores"
        />
        <KPICard
          label="Instruments"
          value={data.severityDistribution.length}
          subtext="unique instruments used"
        />
        <KPICard
          label="Flagged Scores"
          value={data.totalFlagged}
          subtext={`${data.flagBreakdown.mentorNotify} mentor · ${data.flagBreakdown.adminReview} admin`}
          accent={data.totalFlagged > 0 ? "#EF4444" : undefined}
        />
        <KPICard
          label="Safeguarding Actions"
          value={data.safeguardingByStatus.reduce((sum: number, s: { count: number }) => sum + s.count, 0)}
          subtext="total actions created"
        />
      </div>

      {/* Score Trends */}
      {trendChartData.length > 1 && data.scoreTrends.length > 0 && (
        <ChartCard
          title="Score Trends Over Time"
          description="Average scores per instrument by month"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#737373" }}
                  axisLine={{ stroke: "#E5E5E5" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#737373" }}
                  axisLine={{ stroke: "#E5E5E5" }}
                  tickLine={false}
                  width={35}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E5E5E5",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                {data.scoreTrends.map((trend: { shortCode: string }, i: number) => (
                  <Line
                    key={trend.shortCode}
                    type="monotone"
                    dataKey={trend.shortCode}
                    name={trend.shortCode}
                    stroke={CHART_PALETTE[i % CHART_PALETTE.length]}
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 2, stroke: "#fff" }}
                    connectNulls
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}

      {/* Severity Distribution */}
      {data.severityDistribution.length > 0 && (
        <ChartCard
          title="Severity Distribution by Instrument"
          description="Score band breakdown per assessment instrument"
        >
          <div className="space-y-4">
            {data.severityDistribution.map((instrument: { shortCode: string; name: string; bands: Array<{ band: string; count: number; pct: number }> }) => (
              <div key={instrument.shortCode}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-[#171717]">
                    {instrument.shortCode}
                  </span>
                  <span className="text-xs text-[#737373]">
                    {instrument.name}
                  </span>
                </div>
                <div className="flex h-7 overflow-hidden rounded-md">
                  {instrument.bands.map((band: { band: string; count: number; pct: number }) => (
                    <div
                      key={band.band}
                      className="flex items-center justify-center transition-all"
                      style={{
                        width: `${Math.max(band.pct, 3)}%`,
                        backgroundColor:
                          BAND_COLORS[band.band] || "#737373",
                      }}
                      title={`${band.band}: ${band.count} (${band.pct}%)`}
                    >
                      {band.pct >= 12 && (
                        <span className="text-[10px] font-medium text-white">
                          {band.pct}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-1 flex flex-wrap gap-3">
                  {instrument.bands.map((band: { band: string; count: number; pct: number }) => (
                    <div key={band.band} className="flex items-center gap-1">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            BAND_COLORS[band.band] || "#737373",
                        }}
                      />
                      <span className="text-[10px] text-[#737373]">
                        {band.band} ({band.count})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      )}

      {/* Safeguarding + Flags */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Safeguarding by Status">
          {safeguardingChartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={safeguardingChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {safeguardingChartData.map((entry: { fill: string }, i: number) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #E5E5E5",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: unknown) => [String(value), "Actions"]}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-[#737373]">
              No safeguarding actions recorded.
            </p>
          )}
        </ChartCard>

        <ChartCard title="Flag Breakdown" description="Scores triggering alerts by type">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-[#F7F7F7] p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">
                Mentor Notify
              </p>
              <p className={`mt-2 text-3xl font-semibold ${data.flagBreakdown.mentorNotify > 0 ? "text-[#F59E0B]" : "text-[#171717]"}`}>
                {data.flagBreakdown.mentorNotify}
              </p>
              <p className="mt-1 text-xs text-[#737373]">
                flagged for mentor review
              </p>
            </div>
            <div className="rounded-lg bg-[#F7F7F7] p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">
                Admin Review
              </p>
              <p className={`mt-2 text-3xl font-semibold ${data.flagBreakdown.adminReview > 0 ? "text-[#EF4444]" : "text-[#171717]"}`}>
                {data.flagBreakdown.adminReview}
              </p>
              <p className="mt-1 text-xs text-[#737373]">
                flagged for admin review
              </p>
            </div>
          </div>
          {data.totalFlagged === 0 && (
            <p className="mt-4 text-center text-sm text-[#737373]">
              No flagged scores currently.
            </p>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

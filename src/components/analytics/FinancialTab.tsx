"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { KPICard } from "./KPICard";
import { ChartCard } from "./ChartCard";
import {
  BarChart,
  Bar,
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

const CATEGORY_COLORS = [
  "#00D632",
  "#3B82F6",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#E65100",
  "#06B6D4",
];

const EVIDENCE_COLORS: Record<string, string> = {
  "Not Required": "#737373",
  Pending: "#F59E0B",
  Submitted: "#3B82F6",
  Verified: "#00D632",
  Overdue: "#EF4444",
};

const PIPELINE_COLORS: Record<string, string> = {
  draft: "#737373",
  submitted: "#3B82F6",
  under_review: "#F59E0B",
  approved: "#00D632",
  declined: "#EF4444",
  disbursed: "#8B5CF6",
  evidence_requested: "#E65100",
  evidence_submitted: "#06B6D4",
  verified: "#00D632",
  closed: "#737373",
};

export function FinancialTab() {
  const data = useQuery(api.reportAnalytics.financialMetrics);
  const overdue = useQuery(api.disbursements.listOverdue);

  if (data === undefined || overdue === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  const categoryChartData = data.byCategory.map((c: { category: string; total: number }) => ({
    name: c.category.charAt(0).toUpperCase() + c.category.slice(1),
    value: c.total,
  }));

  const monthlyChartData = data.monthlySpending.map((m: { month: string; total: number; count: number }) => ({
    month: new Date(m.month + "-01").toLocaleDateString("en-GB", {
      month: "short",
      year: "2-digit",
    }),
    total: m.total,
    count: m.count,
  }));

  const evidenceChartData = [
    { name: "Not Required", value: data.evidenceTracking.notRequired },
    { name: "Pending", value: data.evidenceTracking.pending },
    { name: "Submitted", value: data.evidenceTracking.submitted },
    { name: "Verified", value: data.evidenceTracking.verified },
    { name: "Overdue", value: data.evidenceTracking.overdue },
  ].filter((d: { name: string; value: number }) => d.value > 0);

  const pipelineChartData = data.requestPipeline.map((r: { status: string; count: number }) => ({
    status: r.status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c: string) => c.toUpperCase()),
    count: r.count,
    fill: PIPELINE_COLORS[r.status] || "#737373",
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Total Disbursed"
          value={`₦${data.totalDisbursed.toLocaleString()}`}
          subtext={`${data.count} disbursements`}
          accent="#00D632"
        />
        <KPICard
          label="Disbursement Count"
          value={data.count}
          subtext="total processed"
        />
        <KPICard
          label="Average Amount"
          value={`₦${data.avgAmount.toLocaleString()}`}
          subtext="per disbursement"
        />
        <KPICard
          label="Overdue Evidence"
          value={data.evidenceTracking.overdue}
          subtext={`${data.evidenceTracking.pending} pending`}
          accent={data.evidenceTracking.overdue > 0 ? "#EF4444" : undefined}
        />
      </div>

      {/* Monthly Spending + Category */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Monthly Spending"
          description="Disbursement totals by month"
        >
          {monthlyChartData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#F0F0F0"
                    vertical={false}
                  />
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
                    width={50}
                    tickFormatter={(v: number) =>
                      `₦${(v / 1000).toFixed(0)}k`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #E5E5E5",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: unknown) => [
                      `₦${Number(value).toLocaleString()}`,
                      "Amount",
                    ]}
                  />
                  <Bar
                    dataKey="total"
                    fill="#00D632"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-[#737373]">
              No disbursement data yet.
            </p>
          )}
        </ChartCard>

        <ChartCard
          title="Spending by Category"
          description="Disbursement amounts by support type"
        >
          {categoryChartData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryChartData.map((_: unknown, i: number) => (
                      <Cell
                        key={i}
                        fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #E5E5E5",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: unknown) => [
                      `₦${Number(value).toLocaleString()}`,
                      "Amount",
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-[#737373]">
              No category data yet.
            </p>
          )}
        </ChartCard>
      </div>

      {/* Evidence Tracking */}
      {evidenceChartData.length > 0 && (
        <ChartCard
          title="Evidence Tracking"
          description="Disbursement evidence status breakdown"
        >
          <div className="h-16">
            <div className="flex h-10 overflow-hidden rounded-lg">
              {evidenceChartData.map((item: { name: string; value: number }) => {
                const total = evidenceChartData.reduce(
                  (s: number, d: { value: number }) => s + d.value,
                  0,
                );
                const pct = total > 0 ? (item.value / total) * 100 : 0;
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-center transition-all"
                    style={{
                      width: `${Math.max(pct, 3)}%`,
                      backgroundColor:
                        EVIDENCE_COLORS[item.name] || "#737373",
                    }}
                    title={`${item.name}: ${item.value}`}
                  >
                    {pct >= 12 && (
                      <span className="text-[10px] font-medium text-white">
                        {item.value}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex flex-wrap gap-4">
              {evidenceChartData.map((item: { name: string; value: number }) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        EVIDENCE_COLORS[item.name] || "#737373",
                    }}
                  />
                  <span className="text-xs text-[#737373]">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      )}

      {/* Support Request Pipeline */}
      {pipelineChartData.length > 0 && (
        <ChartCard
          title="Support Request Pipeline"
          description="Requests by status stage"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineChartData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F0F0F0"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: "#737373" }}
                  axisLine={{ stroke: "#E5E5E5" }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="status"
                  tick={{ fontSize: 11, fill: "#737373" }}
                  axisLine={{ stroke: "#E5E5E5" }}
                  tickLine={false}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E5E5E5",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: unknown) => [String(value), "Requests"]}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {pipelineChartData.map((entry: { fill: string }, i: number) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}

      {/* Overdue Evidence List */}
      {overdue.length > 0 && (
        <ChartCard
          title={`Overdue Evidence (${overdue.length})`}
          description="Disbursements with evidence past due date"
        >
          <div className="space-y-2">
            {overdue.map((d) => (
              <div
                key={d._id}
                className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/50 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-[#171717]">
                    {d.beneficiary?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-[#737373]">
                    ₦{d.amount.toLocaleString()} · Due{" "}
                    {d.evidenceDueDate
                      ? new Date(d.evidenceDueDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-600">
                  Overdue
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  );
}

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
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const LIFECYCLE_COLORS: Record<string, string> = {
  applicant: "#737373",
  active: "#00D632",
  paused: "#F59E0B",
  completed: "#3B82F6",
  alumni: "#8B5CF6",
  withdrawn: "#EF4444",
};

const CATEGORY_COLORS = [
  "#00D632",
  "#3B82F6",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#E65100",
  "#06B6D4",
];

export function OverviewTab() {
  const kpis = useQuery(api.reportAnalytics.overviewKPIs);
  const beneficiaryData = useQuery(api.reportAnalytics.beneficiaryBreakdown);
  const programData = useQuery(api.reportAnalytics.programMetrics, {});
  const financialData = useQuery(api.reportAnalytics.financialMetrics);

  if (
    kpis === undefined ||
    beneficiaryData === undefined ||
    programData === undefined ||
    financialData === undefined
  ) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  const lifecycleOrder = [
    "applicant",
    "active",
    "paused",
    "completed",
    "alumni",
    "withdrawn",
  ];
  const lifecycleChartData = lifecycleOrder
    .map((status) => {
      const item = beneficiaryData.lifecycleDistribution.find(
        (d: { status: string; count: number }) => d.status === status,
      );
      return { status: status.charAt(0).toUpperCase() + status.slice(1), count: item?.count || 0, fill: LIFECYCLE_COLORS[status] || "#737373" };
    })
    .filter((d: { status: string; count: number; fill: string }) => d.count > 0);

  return (
    <div className="min-w-0 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KPICard
          label="Active Beneficiaries"
          value={kpis.activeBeneficiaries}
          subtext={`of ${kpis.totalBeneficiaries} total`}
          accent="#00D632"
        />
        <KPICard
          label="Active Cohorts"
          value={kpis.activeCohorts}
          subtext={`${kpis.sessionsDelivered} sessions delivered`}
        />
        <KPICard
          label="Attendance Rate"
          value={`${kpis.overallAttendanceRate}%`}
          subtext="overall average"
          accent="#3B82F6"
        />
        <KPICard
          label="Total Disbursed"
          value={`₦${kpis.totalDisbursed.toLocaleString()}`}
          subtext={`${kpis.assessmentsCompleted} assessments completed`}
        />
        <KPICard
          label="Open Alerts"
          value={kpis.openSafeguardingActions}
          subtext={`${kpis.pendingSupportRequests} pending requests`}
          accent={kpis.openSafeguardingActions > 0 ? "#EF4444" : undefined}
        />
      </div>

      {/* Row 2: Lifecycle + Attendance */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Beneficiary Lifecycle" description="Distribution by current status">
          {lifecycleChartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lifecycleChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: "#737373" }} axisLine={{ stroke: "#E5E5E5" }} tickLine={false} />
                  <YAxis type="category" dataKey="status" tick={{ fontSize: 12, fill: "#737373" }} axisLine={{ stroke: "#E5E5E5" }} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E5E5", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: unknown) => [String(value), "Beneficiaries"]}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {lifecycleChartData.map((entry: { fill: string }, i: number) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-[#737373]">No beneficiary data yet.</p>
          )}
        </ChartCard>

        <ChartCard title="Attendance Trend" description="Session-by-session attendance rate">
          {programData.attendanceTrend.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={programData.attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis dataKey="sessionNumber" tick={{ fontSize: 12, fill: "#737373" }} axisLine={{ stroke: "#E5E5E5" }} tickLine={false} label={{ value: "Session", position: "insideBottom", offset: -5, fontSize: 11, fill: "#737373" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#737373" }} axisLine={{ stroke: "#E5E5E5" }} tickLine={false} width={35} domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E5E5", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: unknown) => [`${value}%`, "Attendance"]}
                    labelFormatter={(label: unknown) => `Session ${label}`}
                  />
                  <Area type="monotone" dataKey="rate" stroke="#00D632" fill="#00D632" fillOpacity={0.15} strokeWidth={2} dot={{ fill: "#00D632", r: 3, strokeWidth: 2, stroke: "#fff" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-[#737373]">No attendance data yet.</p>
          )}
        </ChartCard>
      </div>

      {/* Row 3: Spending by Category + Safeguarding */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Spending by Category" description="Disbursement amounts by support type">
          {financialData.byCategory.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={financialData.byCategory.map((c: { category: string; total: number }) => ({
                      name: c.category.charAt(0).toUpperCase() + c.category.slice(1),
                      value: c.total,
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {financialData.byCategory.map((_: unknown, i: number) => (
                      <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E5E5", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: unknown) => [`₦${Number(value).toLocaleString()}`, "Amount"]}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-[#737373]">No disbursement data yet.</p>
          )}
        </ChartCard>

        <ChartCard title="Safeguarding & Support" description="Open actions and pending requests">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-[#F7F7F7] p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Safeguarding Actions</p>
              <p className={`mt-2 text-3xl font-semibold ${kpis.openSafeguardingActions > 0 ? "text-[#EF4444]" : "text-[#171717]"}`}>
                {kpis.openSafeguardingActions}
              </p>
              <p className="mt-1 text-xs text-[#737373]">open / in progress</p>
            </div>
            <div className="rounded-lg bg-[#F7F7F7] p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Pending Requests</p>
              <p className={`mt-2 text-3xl font-semibold ${kpis.pendingSupportRequests > 0 ? "text-[#F59E0B]" : "text-[#171717]"}`}>
                {kpis.pendingSupportRequests}
              </p>
              <p className="mt-1 text-xs text-[#737373]">awaiting review</p>
            </div>
            <div className="rounded-lg bg-[#F7F7F7] p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Assessments Done</p>
              <p className="mt-2 text-3xl font-semibold text-[#171717]">{kpis.assessmentsCompleted}</p>
              <p className="mt-1 text-xs text-[#737373]">completed</p>
            </div>
            <div className="rounded-lg bg-[#F7F7F7] p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Sessions Delivered</p>
              <p className="mt-2 text-3xl font-semibold text-[#171717]">{kpis.sessionsDelivered}</p>
              <p className="mt-1 text-xs text-[#737373]">completed</p>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

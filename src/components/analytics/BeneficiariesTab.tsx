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

const LIFECYCLE_COLORS: Record<string, string> = {
  Applicant: "#737373",
  Active: "#00D632",
  Paused: "#F59E0B",
  Completed: "#3B82F6",
  Alumni: "#8B5CF6",
  Withdrawn: "#EF4444",
};

const GENDER_COLORS = ["#3B82F6", "#8B5CF6", "#F59E0B", "#737373"];

const COMPLETION_COLORS = ["#EF4444", "#F59E0B", "#3B82F6", "#00D632"];

export function BeneficiariesTab() {
  const data = useQuery(api.reportAnalytics.beneficiaryBreakdown);

  if (data === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  const lifecycleOrder = ["applicant", "active", "paused", "completed", "alumni", "withdrawn"];
  const lifecycleChartData = lifecycleOrder
    .map((status) => {
      const item = data.lifecycleDistribution.find((d: { status: string; count: number }) => d.status === status);
      const label = status.charAt(0).toUpperCase() + status.slice(1);
      return { status: label, count: item?.count || 0 };
    })
    .filter((d: { status: string; count: number }) => d.count > 0);

  const genderChartData = data.genderDistribution.map((g: { gender: string; count: number }) => ({
    name: g.gender,
    value: g.count,
  }));

  return (
    <div className="min-w-0 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Total Beneficiaries"
          value={data.total}
          subtext="all lifecycle stages"
        />
        <KPICard
          label="Retention Rate"
          value={`${data.retentionRate}%`}
          subtext="active / (active + withdrawn)"
          accent="#00D632"
        />
        <KPICard
          label="Avg Profile Completion"
          value={`${data.avgProfileCompletion}%`}
          subtext="across all beneficiaries"
          accent="#3B82F6"
        />
        <KPICard
          label="Active"
          value={data.lifecycleDistribution.find((d: { status: string; count: number }) => d.status === "active")?.count || 0}
          subtext="currently active"
          accent="#00D632"
        />
      </div>

      {/* Row 2: Lifecycle + Gender */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Lifecycle Status Distribution" description="Beneficiaries by current stage">
          {lifecycleChartData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lifecycleChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                  <XAxis dataKey="status" tick={{ fontSize: 12, fill: "#737373" }} axisLine={{ stroke: "#E5E5E5" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#737373" }} axisLine={{ stroke: "#E5E5E5" }} tickLine={false} width={35} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E5E5", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: unknown) => [String(value), "Beneficiaries"]}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {lifecycleChartData.map((entry: { status: string; count: number }, i: number) => (
                      <Cell key={i} fill={LIFECYCLE_COLORS[entry.status] || "#737373"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-[#737373]">No beneficiary data yet.</p>
          )}
        </ChartCard>

        <ChartCard title="Gender Distribution">
          {genderChartData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} (${(((percent ?? 0)) * 100).toFixed(0)}%)`}
                  >
                    {genderChartData.map((_: unknown, i: number) => (
                      <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E5E5", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: unknown) => [String(value), "Beneficiaries"]}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-[#737373]">No gender data available.</p>
          )}
        </ChartCard>
      </div>

      {/* Row 3: Profile Completion + Top States */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Profile Completion" description="Distribution across completion ranges">
          {data.profileCompletionBuckets.some((b: { bucket: string; count: number }) => b.count > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.profileCompletionBuckets}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                  <XAxis dataKey="bucket" tick={{ fontSize: 12, fill: "#737373" }} axisLine={{ stroke: "#E5E5E5" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#737373" }} axisLine={{ stroke: "#E5E5E5" }} tickLine={false} width={35} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E5E5", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: unknown) => [String(value), "Beneficiaries"]}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.profileCompletionBuckets.map((_: unknown, i: number) => (
                      <Cell key={i} fill={COMPLETION_COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-[#737373]">No profile data yet.</p>
          )}
        </ChartCard>

        <ChartCard title="Top States of Origin" description="Top 10 states represented">
          {data.stateDistribution.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.stateDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: "#737373" }} axisLine={{ stroke: "#E5E5E5" }} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="state" tick={{ fontSize: 11, fill: "#737373" }} axisLine={{ stroke: "#E5E5E5" }} tickLine={false} width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E5E5", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: unknown) => [String(value), "Beneficiaries"]}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-[#737373]">No state data available.</p>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

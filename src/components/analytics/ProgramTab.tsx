"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { KPICard } from "./KPICard";
import { ChartCard } from "./ChartCard";
import { Select } from "@/components/ui/select";
import type { Id } from "../../../convex/_generated/dataModel";
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
  BarChart,
  Bar,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  draft: "#737373",
  upcoming: "#3B82F6",
  active: "#00D632",
  completed: "#8B5CF6",
  cancelled: "#EF4444",
};

const PILLAR_COLORS = ["#00D632", "#3B82F6", "#F59E0B", "#8B5CF6", "#EF4444", "#E65100", "#06B6D4"];

export function ProgramTab() {
  const [selectedCohort, setSelectedCohort] = useState("");
  const cohorts = useQuery(api.cohorts.list);
  const data = useQuery(
    api.reportAnalytics.programMetrics,
    selectedCohort ? { cohortId: selectedCohort as Id<"cohorts"> } : {},
  );

  if (data === undefined || cohorts === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  const totalSessions = data.sessionStatusBreakdown.reduce(
    (sum: number, s: { status: string; count: number }) => sum + s.count,
    0,
  );
  const completedSessions =
    data.sessionStatusBreakdown.find((s: { status: string; count: number }) => s.status === "completed")?.count || 0;
  const uniquePillars = data.pillarCoverage.length;
  const avgAttendance =
    data.attendanceTrend.length > 0
      ? Math.round(
          data.attendanceTrend.reduce((sum: number, a: { rate: number }) => sum + a.rate, 0) /
            data.attendanceTrend.length,
        )
      : 0;

  const statusChartData = data.sessionStatusBreakdown.map((s: { status: string; count: number }) => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    value: s.count,
    fill: STATUS_COLORS[s.status] || "#737373",
  }));

  return (
    <div className="min-w-0 space-y-6">
      {/* Cohort filter */}
      <div className="max-w-xs">
        <Select
          value={selectedCohort}
          onChange={setSelectedCohort}
          placeholder="All cohorts"
          options={[
            { label: "All cohorts", value: "" },
            ...cohorts.map((c: { name: string; _id: string }) => ({ label: c.name, value: c._id })),
          ]}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Total Sessions" value={totalSessions} subtext="across program" />
        <KPICard label="Completed" value={completedSessions} subtext="sessions delivered" accent="#00D632" />
        <KPICard label="Attendance Rate" value={`${avgAttendance}%`} subtext="average across sessions" accent="#3B82F6" />
        <KPICard label="Pillars Covered" value={uniquePillars} subtext="unique pillars" />
      </div>

      {/* Attendance Trend */}
      <ChartCard title="Attendance Trend" description="Attendance rate per session over time">
        {data.attendanceTrend.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis
                  dataKey="sessionNumber"
                  tick={{ fontSize: 12, fill: "#737373" }}
                  axisLine={{ stroke: "#E5E5E5" }}
                  tickLine={false}
                  label={{ value: "Session #", position: "insideBottom", offset: -5, fontSize: 11, fill: "#737373" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#737373" }}
                  axisLine={{ stroke: "#E5E5E5" }}
                  tickLine={false}
                  width={40}
                  domain={[0, 100]}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E5E5", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(value: unknown) => [`${value}%`, "Attendance"]}
                  labelFormatter={(label: unknown) => `Session ${label}`}
                />
                <Line type="monotone" dataKey="rate" stroke="#00D632" strokeWidth={2} dot={{ fill: "#00D632", r: 4, strokeWidth: 2, stroke: "#fff" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-[#737373]">No attendance data yet.</p>
        )}
      </ChartCard>

      {/* Session Status + Pillar Coverage */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Session Status" description="Breakdown by current status">
          {statusChartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={2} dataKey="value">
                    {statusChartData.map((entry: { fill: string }, i: number) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E5E5", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: unknown) => [String(value), "Sessions"]}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-[#737373]">No session data yet.</p>
          )}
        </ChartCard>

        <ChartCard title="Pillar Coverage" description="Sessions per pillar (completed vs remaining)">
          {data.pillarCoverage.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.pillarCoverage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                  <XAxis dataKey="pillar" tick={{ fontSize: 11, fill: "#737373" }} axisLine={{ stroke: "#E5E5E5" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#737373" }} axisLine={{ stroke: "#E5E5E5" }} tickLine={false} width={35} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E5E5", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Bar dataKey="completedCount" name="Completed" fill="#00D632" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="sessionsCount" name="Total" fill="#E5E5E5" stackId="b" radius={[4, 4, 0, 0]} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-[#737373]">No pillar data yet.</p>
          )}
        </ChartCard>
      </div>

      {/* Cohort Progress */}
      {data.cohortProgress.length > 0 && (
        <ChartCard title="Cohort Progress" description="Session completion per cohort">
          <div className="space-y-3">
            {data.cohortProgress.map((cp: { cohortName: string; progressPercent: number; completedSessions: number; totalSessions: number }) => (
              <div key={cp.cohortName} className="flex min-w-0 items-center gap-4">
                <span className="w-24 shrink-0 truncate text-sm font-medium text-[#171717] sm:w-32">
                  {cp.cohortName}
                </span>
                <div className="flex-1">
                  <div className="h-6 overflow-hidden rounded-full bg-[#F0F0F0]">
                    <div
                      className="flex h-full items-center rounded-full bg-[#00D632] px-2 transition-all"
                      style={{ width: `${Math.max(cp.progressPercent, 2)}%` }}
                    >
                      {cp.progressPercent > 15 && (
                        <span className="text-[10px] font-medium text-white">
                          {cp.progressPercent}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-[#737373]">
                  {cp.completedSessions}/{cp.totalSessions}
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  );
}

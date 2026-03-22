"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";

export function FacilitatorDashboard() {
  const sessions = useQuery(api.sessions.listByFacilitator);
  const materials = useQuery(api.materials.list, {});

  const upcomingSessions = sessions?.filter(
    (s) => s.status === "upcoming" || s.status === "active",
  );
  const completedSessions = sessions?.filter((s) => s.status === "completed");

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-xl font-semibold text-[#171717]">Facilitator Dashboard</h1>
      <p className="mt-1 text-sm text-[#737373]">Your sessions and materials.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/facilitator/sessions" className="rounded-xl border border-[#E5E5E5] bg-white p-5 hover:border-[#D4D4D4]">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Upcoming</p>
          <p className="mt-2 text-2xl font-semibold text-[#171717]">{upcomingSessions?.length ?? 0}</p>
          <p className="mt-0.5 text-xs text-[#737373]">sessions</p>
        </Link>

        <Link href="/facilitator/sessions" className="rounded-xl border border-[#E5E5E5] bg-white p-5 hover:border-[#D4D4D4]">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Completed</p>
          <p className="mt-2 text-2xl font-semibold text-[#171717]">{completedSessions?.length ?? 0}</p>
          <p className="mt-0.5 text-xs text-[#737373]">sessions</p>
        </Link>

        <Link href="/library" className="rounded-xl border border-[#E5E5E5] bg-white p-5 hover:border-[#D4D4D4]">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Materials</p>
          <p className="mt-2 text-2xl font-semibold text-[#171717]">{materials?.length ?? 0}</p>
          <p className="mt-0.5 text-xs text-[#737373]">in library</p>
        </Link>
      </div>

      {/* Upcoming sessions */}
      {upcomingSessions && upcomingSessions.length > 0 && (
        <div className="mt-6 rounded-xl border border-[#E5E5E5] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Upcoming Sessions</p>
            <Link href="/facilitator/sessions" className="text-xs text-[#737373] hover:text-[#171717]">View all</Link>
          </div>
          <div className="mt-3 space-y-2">
            {upcomingSessions.slice(0, 5).map((s) => (
              <Link key={s._id} href={`/facilitator/sessions/${s._id}`}
                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-[#F7F7F7]">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E6FBF0] text-xs font-bold text-[#00D632]">
                    {s.sessionNumber}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#171717]">{s.title}</p>
                    <p className="text-xs text-[#737373]">{s.pillar?.replace("_", " ")}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.status === "active" ? "bg-[#E6FBF0] text-[#00D632]" : "bg-blue-50 text-blue-600"}`}>
                  {s.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick link to materials */}
      <div className="mt-6">
        <Link href="/library" className="flex items-center gap-3 rounded-xl border border-[#E5E5E5] bg-white p-4 transition-colors hover:border-[#D4D4D4]">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round"><path d="M2 3h4l1.5 1.5H12v8H2V3z" /></svg>
          </div>
          <span className="text-sm font-medium text-[#171717]">Manage Materials</span>
        </Link>
      </div>
    </div>
  );
}

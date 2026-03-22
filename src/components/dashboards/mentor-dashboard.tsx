"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";

export function MentorDashboard() {
  const mentees = useQuery(api.mentorAssignments.getMyMentees);
  const safeguardingActions = useQuery(api.safeguarding.getMyAssigned);
  const notifications = useQuery(api.notifications.getMyNotifications);

  const openActions = safeguardingActions?.filter(
    (a) => a.status === "open" || a.status === "in_progress",
  );
  const recentNotifications = notifications?.slice(0, 5);

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-xl font-semibold text-[#171717]">Mentor Dashboard</h1>
      <p className="mt-1 text-sm text-[#737373]">Your mentees and activity overview.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/mentor/mentees" className="rounded-xl border border-[#E5E5E5] bg-white p-5 hover:border-[#D4D4D4]">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Mentees</p>
          <p className="mt-2 text-2xl font-semibold text-[#171717]">{mentees?.length ?? 0}</p>
          <p className="mt-0.5 text-xs text-[#737373]">active mentees</p>
        </Link>

        <Link href="/mentor/mentees" className="rounded-xl border border-[#E5E5E5] bg-white p-5 hover:border-[#D4D4D4]">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Alerts</p>
          <p className={`mt-2 text-2xl font-semibold ${openActions && openActions.length > 0 ? "text-red-600" : "text-[#171717]"}`}>
            {openActions?.length ?? 0}
          </p>
          <p className="mt-0.5 text-xs text-[#737373]">safeguarding actions</p>
        </Link>

        <Link href="/mentor/notes" className="rounded-xl border border-[#E5E5E5] bg-white p-5 hover:border-[#D4D4D4]">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Notes</p>
          <p className="mt-2 text-2xl font-semibold text-[#171717]">—</p>
          <p className="mt-0.5 text-xs text-[#737373]">mentor notes</p>
        </Link>
      </div>

      {/* Mentee list */}
      {mentees && mentees.length > 0 && (
        <div className="mt-6 rounded-xl border border-[#E5E5E5] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">My Mentees</p>
            <Link href="/mentor/mentees" className="text-xs text-[#737373] hover:text-[#171717]">View all</Link>
          </div>
          <div className="mt-3 space-y-2">
            {mentees.slice(0, 5).map((m) => (
              <Link key={m.assignment._id} href={`/mentor/mentees/${m.beneficiary?._id}`}
                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-[#F7F7F7]">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E6FBF0] text-xs font-medium text-[#00D632]">
                    {(m.beneficiary?.name?.[0] || "?").toUpperCase()}
                  </div>
                  <span className="text-sm text-[#171717]">{m.beneficiary?.name || "Unknown"}</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#D4D4D4" strokeWidth="1.5" strokeLinecap="round"><path d="M5 3l4 4-4 4" /></svg>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent notifications */}
      {recentNotifications && recentNotifications.length > 0 && (
        <div className="mt-6 rounded-xl border border-[#E5E5E5] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Recent Activity</p>
            <Link href="/notifications" className="text-xs text-[#737373] hover:text-[#171717]">View all</Link>
          </div>
          <div className="mt-3 space-y-2">
            {recentNotifications.map((n) => (
              <div key={n._id} className="rounded-lg px-3 py-2 text-sm">
                <p className="text-[#262626]">{n.title}</p>
                <p className="text-xs text-[#737373]">{n.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

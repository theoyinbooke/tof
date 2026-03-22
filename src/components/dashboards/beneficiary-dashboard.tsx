"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";

export function BeneficiaryDashboard() {
  const profile = useQuery(api.beneficiaries.getMyProfile);
  const assignments = useQuery(api.assessments.assignments.getMyAssignments);
  const sessions = useQuery(api.sessions.listByBeneficiary);
  const notifications = useQuery(api.notifications.getMyNotifications);

  const pendingAssessments = assignments?.filter(
    (a) => a.status === "assigned" || a.status === "in_progress",
  );
  const upcomingSessions = sessions?.filter(
    (s) => s && (s.status === "upcoming" || s.status === "active"),
  );
  const recentNotifications = notifications?.slice(0, 5);

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-xl font-semibold text-[#171717]">Dashboard</h1>
      <p className="mt-1 text-sm text-[#737373]">Welcome back. Here&apos;s your overview.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Profile completion */}
        <Link href="/profile" className="rounded-xl border border-[#E5E5E5] bg-white p-5 transition-colors hover:border-[#D4D4D4]">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Profile</p>
          <p className="mt-2 text-2xl font-semibold text-[#171717]">
            {profile?.profileCompletionPercent ?? 0}%
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E5E5E5]">
            <div className="h-full rounded-full bg-[#00D632] transition-all" style={{ width: `${profile?.profileCompletionPercent ?? 0}%` }} />
          </div>
          <p className="mt-1 text-xs text-[#737373]">Complete your profile</p>
        </Link>

        {/* Pending assessments */}
        <Link href="/beneficiary/assessments" className="rounded-xl border border-[#E5E5E5] bg-white p-5 transition-colors hover:border-[#D4D4D4]">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Assessments</p>
          <p className="mt-2 text-2xl font-semibold text-[#171717]">
            {pendingAssessments?.length ?? 0}
          </p>
          <p className="mt-1 text-xs text-[#737373]">pending</p>
        </Link>

        {/* Upcoming sessions */}
        <Link href="/beneficiary/sessions" className="rounded-xl border border-[#E5E5E5] bg-white p-5 transition-colors hover:border-[#D4D4D4]">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Sessions</p>
          <p className="mt-2 text-2xl font-semibold text-[#171717]">
            {upcomingSessions?.length ?? 0}
          </p>
          <p className="mt-1 text-xs text-[#737373]">upcoming</p>
        </Link>
      </div>

      {/* Next session */}
      {upcomingSessions && upcomingSessions.length > 0 && upcomingSessions[0] && (
        <div className="mt-6 rounded-xl border border-[#E5E5E5] bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Next Session</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E6FBF0] text-sm font-bold text-[#00D632]">
              {upcomingSessions[0].sessionNumber}
            </span>
            <div>
              <p className="text-sm font-medium text-[#171717]">{upcomingSessions[0].title}</p>
              <p className="text-xs text-[#737373]">{upcomingSessions[0].pillar?.replace("_", " ")}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href="/beneficiary/support" className="flex items-center gap-3 rounded-xl border border-[#E5E5E5] bg-white p-4 transition-colors hover:border-[#D4D4D4]">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="6" /><path d="M5 5.5a2 2 0 013.5 1.5c0 1-1.5 1.5-1.5 1.5M7 10h.01" /></svg>
          </div>
          <span className="text-sm font-medium text-[#171717]">Support Requests</span>
        </Link>
        <Link href="/library" className="flex items-center gap-3 rounded-xl border border-[#E5E5E5] bg-white p-4 transition-colors hover:border-[#D4D4D4]">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round"><path d="M2 3h4l1.5 1.5H12v8H2V3z" /></svg>
          </div>
          <span className="text-sm font-medium text-[#171717]">Resource Library</span>
        </Link>
      </div>

      {/* Recent notifications */}
      {recentNotifications && recentNotifications.length > 0 && (
        <div className="mt-6 rounded-xl border border-[#E5E5E5] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Recent Notifications</p>
            <Link href="/notifications" className="text-xs text-[#737373] hover:text-[#171717]">View all</Link>
          </div>
          <div className="mt-3 space-y-2">
            {recentNotifications.map((n) => (
              <div key={n._id} className={`rounded-lg px-3 py-2 text-sm ${!n.isRead ? "bg-[#FAFFF5]" : ""}`}>
                <p className={`${!n.isRead ? "font-medium text-[#171717]" : "text-[#262626]"}`}>{n.title}</p>
                <p className="text-xs text-[#737373]">{n.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";

function formatDateDisplay(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-[#E6FBF0] text-[#00D632]",
  upcoming: "bg-blue-50 text-blue-600",
  completed: "bg-[#F0F0F0] text-[#525252]",
  cancelled: "bg-red-50 text-[#EF4444]",
  draft: "bg-[#F0F0F0] text-[#737373]",
};

export default function BeneficiarySessionsPage() {
  const sessions = useQuery(api.sessions.listByBeneficiary);

  if (sessions === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-xl font-semibold text-[#171717]">My Sessions</h1>
      <p className="mt-1 text-sm text-[#737373]">
        Sessions you are enrolled in.
      </p>

      {sessions.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E6FBF0]">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00D632"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <h2 className="mt-4 text-base font-semibold text-[#171717]">
            No sessions yet
          </h2>
          <p className="mt-1 text-sm text-[#737373]">
            You will see your sessions here once enrolled.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {sessions.map(
            (s) =>
              s && (
                <div
                  key={s._id}
                  className="rounded-xl border border-[#E5E5E5] bg-white p-4"
                >
                  {/* Top row: session number, title, status badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E6FBF0] text-xs font-bold text-[#00D632]">
                        {s.sessionNumber}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#171717]">
                          {s.title}
                        </p>
                        <p className="text-xs capitalize text-[#737373]">
                          {s.pillar?.replace(/_/g, " ") || ""}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[s.status] || STATUS_COLORS.draft
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  {/* Details row */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-2 sm:gap-x-4 gap-y-1 text-xs text-[#737373]">
                    {s.scheduledDate && (
                      <span className="flex items-center gap-1">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <path d="M16 2v4M8 2v4M3 10h18" />
                        </svg>
                        {formatDateDisplay(s.scheduledDate)}
                      </span>
                    )}
                    {s.facilitatorName && (
                      <span className="flex items-center gap-1">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        {s.facilitatorName}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {s.description && (
                    <p className="mt-2 text-sm text-[#737373]">
                      {s.description}
                    </p>
                  )}

                  {/* Assessment link */}
                  {s.assessmentAssignmentId && (
                    <div className="mt-3 border-t border-[#F0F0F0] pt-3">
                      <Link
                        href={`/beneficiary/assessments/${s.assessmentAssignmentId}`}
                        className="inline-flex items-center gap-1.5 rounded-md bg-[#E6FBF0] px-3 py-1.5 text-xs font-medium text-[#00D632] transition-colors hover:bg-[#D0F5E0]"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9 11l3 3L22 4" />
                          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                        </svg>
                        Take Assessment
                      </Link>
                    </div>
                  )}
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  assigned: "bg-blue-50 text-blue-600",
  in_progress: "bg-yellow-50 text-yellow-600",
  completed: "bg-[#E6FBF0] text-[#00D632]",
  overdue: "bg-red-50 text-red-600",
};

export default function BeneficiaryAssessmentsPage() {
  const assignments = useQuery(api.assessments.assignments.getMyAssignments);

  if (assignments === undefined) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" /></div>;
  }

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-xl font-semibold text-[#171717]">My Assessments</h1>
      <p className="mt-1 text-sm text-[#737373]">Complete your assigned assessments.</p>

      {assignments.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E6FBF0]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D632" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <h2 className="mt-4 text-base font-semibold text-[#171717]">No assessments</h2>
          <p className="mt-1 text-sm text-[#737373]">You have no pending assessments.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {assignments.map((a) => (
            <Link key={a._id} href={`/beneficiary/assessments/${a._id}`}
              className="block rounded-xl border border-[#E5E5E5] bg-white p-4 transition-colors hover:border-[#D4D4D4]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-10 items-center justify-center rounded bg-[#F0F0F0] text-[10px] font-bold text-[#525252]">
                    {a.template?.shortCode || "?"}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#171717]">{a.template?.name || "Unknown"}</p>
                    <p className="text-xs text-[#737373]">
                      {a.template?.items.length || 0} questions
                      {a.dueDate ? ` · Due ${new Date(a.dueDate).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[a.status] || "bg-[#F0F0F0] text-[#737373]"}`}>
                    {a.status.replace("_", " ")}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#D4D4D4" strokeWidth="1.5" strokeLinecap="round"><path d="M5 3l4 4-4 4" /></svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

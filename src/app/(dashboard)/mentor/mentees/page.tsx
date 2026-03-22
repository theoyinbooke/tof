"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";

export default function MentorMenteesPage() {
  const mentees = useQuery(api.mentorAssignments.getMyMentees);
  const safeguardingActions = useQuery(api.safeguarding.getMyAssigned);

  if (mentees === undefined || safeguardingActions === undefined) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" /></div>;
  }

  const openActions = safeguardingActions.filter((a) => a.status === "open" || a.status === "in_progress");

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-xl font-semibold text-[#171717]">My Mentees</h1>

      {openActions.length > 0 && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <h2 className="text-sm font-semibold text-red-600">Attention Required ({openActions.length})</h2>
          <div className="mt-2 space-y-2">
            {openActions.map((a) => (
              <div key={a._id} className="flex items-center justify-between text-sm">
                <span className="text-red-700">{a.beneficiary?.name || "Unknown"} — {a.template?.shortCode}: {a.score?.severityBand}</span>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] text-red-600">{a.status.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {mentees.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white py-16">
          <h2 className="text-base font-semibold text-[#171717]">No mentees</h2>
          <p className="mt-1 text-sm text-[#737373]">No mentees assigned to you yet.</p>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
          {mentees.map((m, i) => (
            <Link key={m.assignment._id} href={`/mentor/mentees/${m.beneficiary?._id}`}
              className={`flex items-center justify-between px-4 py-3 text-sm hover:bg-[#F7F7F7] ${i > 0 ? "border-t border-[#F0F0F0]" : ""}`}>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E6FBF0] text-xs font-medium text-[#00D632]">
                  {(m.beneficiary?.name?.[0] || "?").toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-[#171717]">{m.beneficiary?.name || "Unknown"}</p>
                  <p className="text-xs text-[#737373]">{m.beneficiary?.email}</p>
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#D4D4D4" strokeWidth="1.5" strokeLinecap="round"><path d="M5 3l4 4-4 4" /></svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

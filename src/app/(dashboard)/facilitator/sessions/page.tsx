"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";

export default function FacilitatorSessionsPage() {
  const sessions = useQuery(api.sessions.listByFacilitator);

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
      <p className="mt-1 text-sm text-[#737373]">Sessions assigned to you.</p>

      {sessions.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white py-16">
          <h2 className="text-base font-semibold text-[#171717]">No sessions</h2>
          <p className="mt-1 text-sm text-[#737373]">No sessions assigned to you yet.</p>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
          {sessions.map((s, i) => (
            <Link key={s._id} href={`/facilitator/sessions/${s._id}`}
              className={`flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-[#F7F7F7] ${i > 0 ? "border-t border-[#F0F0F0]" : ""}`}>
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F0F0] text-xs font-bold text-[#525252]">{s.sessionNumber}</span>
                <div>
                  <p className="font-medium text-[#171717]">{s.title}</p>
                  <p className="text-xs text-[#737373]">{s.pillar?.replace("_", " ")}</p>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.status === "active" ? "bg-[#E6FBF0] text-[#00D632]" : "bg-[#F0F0F0] text-[#737373]"}`}>{s.status}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

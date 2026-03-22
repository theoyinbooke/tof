"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";
import { useState } from "react";

const STATUSES = ["all", "submitted", "under_review", "approved", "disbursed", "evidence_requested", "evidence_submitted", "verified", "declined", "closed"];

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-blue-50 text-blue-600",
  under_review: "bg-yellow-50 text-yellow-600",
  approved: "bg-[#E6FBF0] text-[#00D632]",
  declined: "bg-red-50 text-red-600",
  disbursed: "bg-purple-50 text-purple-600",
  evidence_requested: "bg-yellow-50 text-yellow-600",
  evidence_submitted: "bg-blue-50 text-blue-600",
  verified: "bg-[#E6FBF0] text-[#00D632]",
  closed: "bg-[#F0F0F0] text-[#737373]",
};

type Status = "submitted" | "under_review" | "approved" | "declined" | "disbursed" | "evidence_requested" | "evidence_submitted" | "verified" | "closed";

export default function AdminSupportPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const requests = useQuery(api.support.listWithBeneficiaries, {
    status: statusFilter === "all" ? undefined : statusFilter as Status,
  });

  if (requests === undefined) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" /></div>;
  }

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-xl font-semibold text-[#171717]">Support Requests</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === s ? "bg-[#171717] text-white" : "bg-[#F0F0F0] text-[#525252] hover:bg-[#E5E5E5]"}`}>
            {s === "all" ? "All" : s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {requests.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white py-16">
          <h2 className="text-base font-semibold text-[#171717]">No requests</h2>
          <p className="mt-1 text-sm text-[#737373]">No support requests match this filter.</p>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
          {requests.map((r, i) => (
            <Link key={r._id} href={`/admin/support/${r._id}`}
              className={`flex items-center justify-between px-4 py-3 text-sm hover:bg-[#F7F7F7] ${i > 0 ? "border-t border-[#F0F0F0]" : ""}`}>
              <div>
                <p className="font-medium text-[#171717]">{r.title}</p>
                <p className="text-xs text-[#737373]">{r.beneficiary?.name || "Unknown"} · {r.category} {r.amountRequested ? `· ₦${r.amountRequested.toLocaleString()}` : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status] || "bg-[#F0F0F0] text-[#737373]"}`}>{r.status.replace(/_/g, " ")}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#D4D4D4" strokeWidth="1.5" strokeLinecap="round"><path d="M5 3l4 4-4 4" /></svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

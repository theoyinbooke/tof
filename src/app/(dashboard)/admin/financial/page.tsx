"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";

export default function AdminFinancialPage() {
  const summary = useQuery(api.disbursements.financialSummary);
  const overdue = useQuery(api.disbursements.listOverdue);

  if (summary === undefined || overdue === undefined) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" /></div>;
  }

  const cards = [
    { label: "Total Disbursed", value: `₦${summary.totalDisbursed.toLocaleString()}`, sub: `${summary.disbursementCount} disbursements` },
    { label: "Pending Requests", value: summary.pendingRequests.toString(), sub: `${summary.underReview} under review` },
    { label: "Evidence Pending", value: summary.pendingEvidence.toString(), sub: `${summary.overdueEvidence} overdue` },
    { label: "Verified", value: summary.verified.toString(), sub: "evidence verified" },
  ];

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-xl font-semibold text-[#171717]">Financial Overview</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-[#E5E5E5] bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">{c.label}</p>
            <p className="mt-2 text-2xl font-semibold text-[#171717]">{c.value}</p>
            <p className="mt-0.5 text-xs text-[#737373]">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Overdue evidence */}
      <div className="mt-6 rounded-xl border border-[#E5E5E5] bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">
          Overdue Evidence ({overdue.length})
        </h2>
        {overdue.length === 0 ? (
          <p className="mt-4 text-sm text-[#737373]">No overdue evidence items.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {overdue.map((d) => (
              <Link key={d._id} href={`/admin/support/${d.requestId}`}
                className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/50 px-3 py-2 hover:bg-red-50">
                <div>
                  <p className="text-sm font-medium text-[#171717]">{d.beneficiary?.name || "Unknown"}</p>
                  <p className="text-xs text-[#737373]">₦{d.amount.toLocaleString()} · Due {d.evidenceDueDate ? new Date(d.evidenceDueDate).toLocaleDateString() : "N/A"}</p>
                </div>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-600">Overdue</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

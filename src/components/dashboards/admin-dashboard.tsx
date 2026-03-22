"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { OnboardingChecklist } from "./onboarding-checklist";

export function AdminDashboard() {
  const beneficiaries = useQuery(api.beneficiaries.listBeneficiaries, {});
  const supportRequests = useQuery(api.support.listAll, {});
  const pendingRequests = useQuery(api.support.listAll, { status: "submitted" });
  const sessions = useQuery(api.sessions.list, {});
  const financialSummary = useQuery(api.disbursements.financialSummary);
  const flaggedScores = useQuery(api.assessments.scoring.listFlagged);
  const overdueEvidence = useQuery(api.disbursements.listOverdue);

  const upcomingSessions = sessions?.filter((s) => s.status === "upcoming" || s.status === "active");

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-xl font-semibold text-[#171717]">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-[#737373]">Platform overview and controls.</p>

      {/* Onboarding checklist — auto-hides when all steps complete */}
      <div className="mt-6">
        <OnboardingChecklist />
      </div>

      {/* Summary cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/beneficiaries" className="rounded-xl border border-[#E5E5E5] bg-white p-5 hover:border-[#D4D4D4]">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Beneficiaries</p>
          <p className="mt-2 text-2xl font-semibold text-[#171717]">{beneficiaries?.length ?? "—"}</p>
          <p className="mt-0.5 text-xs text-[#737373]">total profiles</p>
        </Link>

        <Link href="/admin/support" className="rounded-xl border border-[#E5E5E5] bg-white p-5 hover:border-[#D4D4D4]">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Pending Requests</p>
          <p className="mt-2 text-2xl font-semibold text-[#171717]">{pendingRequests?.length ?? "—"}</p>
          <p className="mt-0.5 text-xs text-[#737373]">awaiting review</p>
        </Link>

        <Link href="/admin/sessions" className="rounded-xl border border-[#E5E5E5] bg-white p-5 hover:border-[#D4D4D4]">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Sessions</p>
          <p className="mt-2 text-2xl font-semibold text-[#171717]">{upcomingSessions?.length ?? "—"}</p>
          <p className="mt-0.5 text-xs text-[#737373]">upcoming / active</p>
        </Link>

        <Link href="/admin/financial" className="rounded-xl border border-[#E5E5E5] bg-white p-5 hover:border-[#D4D4D4]">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Disbursed</p>
          <p className="mt-2 text-2xl font-semibold text-[#171717]">
            {financialSummary ? `₦${financialSummary.totalDisbursed.toLocaleString()}` : "—"}
          </p>
          <p className="mt-0.5 text-xs text-[#737373]">{financialSummary?.disbursementCount ?? 0} disbursements</p>
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Assessment completion */}
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Assessments</p>
            <Link href="/admin/assessments" className="text-xs text-[#737373] hover:text-[#171717]">Templates</Link>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xl font-semibold text-[#171717]">{supportRequests?.length ?? 0}</p>
              <p className="text-xs text-[#737373]">total requests</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-[#171717]">{flaggedScores?.length ?? 0}</p>
              <p className="text-xs text-[#737373]">flagged scores</p>
            </div>
          </div>
        </div>

        {/* Flagged scores alert */}
        <Link href="/admin/safeguarding" className="rounded-xl border border-[#E5E5E5] bg-white p-5 hover:border-[#D4D4D4]">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Safeguarding</p>
          {flaggedScores && flaggedScores.length > 0 ? (
            <div className="mt-3">
              <p className="text-xl font-semibold text-red-600">{flaggedScores.length}</p>
              <p className="text-xs text-[#737373]">flagged scores requiring action</p>
              <div className="mt-2 space-y-1">
                {flaggedScores.slice(0, 3).map((s) => (
                  <div key={s._id} className="flex items-center justify-between text-xs">
                    <span className="text-[#171717]">{s.user?.name}</span>
                    <span className={`rounded-full px-2 py-0.5 ${s.flagBehavior === "admin_review" ? "bg-red-50 text-red-600" : "bg-yellow-50 text-yellow-600"}`}>
                      {s.template?.shortCode}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[#737373]">No flagged scores.</p>
          )}
        </Link>
      </div>

      {/* Evidence overdue */}
      {overdueEvidence && overdueEvidence.length > 0 && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-600">Evidence Overdue ({overdueEvidence.length})</p>
          <div className="mt-2 space-y-1">
            {overdueEvidence.slice(0, 5).map((d) => (
              <Link key={d._id} href={`/admin/support/${d.requestId}`} className="flex items-center justify-between text-xs hover:text-red-800">
                <span className="text-red-700">{d.beneficiary?.name} — ₦{d.amount.toLocaleString()}</span>
                <span className="text-red-500">Due {d.evidenceDueDate ? new Date(d.evidenceDueDate).toLocaleDateString() : "N/A"}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

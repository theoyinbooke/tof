"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import { Select } from "@/components/ui/select";

function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportsTab() {
  const beneficiaries = useQuery(api.beneficiaries.listBeneficiaries, {});
  const cohorts = useQuery(api.cohorts.list);

  const exportBeneficiary = useMutation(api.exports.exportBeneficiaryReport);
  const exportCohort = useMutation(api.exports.exportCohortReport);
  const exportFinancial = useMutation(api.exports.exportFinancialReport);
  const transitionAlumni = useMutation(api.exports.transitionToAlumni);

  const [generating, setGenerating] = useState<string | null>(null);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState("");
  const [selectedCohort, setSelectedCohort] = useState("");

  const handleBeneficiaryExport = async () => {
    if (!selectedBeneficiary) return;
    setGenerating("beneficiary");
    try {
      const data = await exportBeneficiary({ userId: selectedBeneficiary as Id<"users"> });
      downloadCsv(`beneficiary_${data.beneficiary.name.replace(/\s+/g, "_")}.csv`,
        ["Name", "Email", "Status", "Profile %", "Attendance Rate", "Assessments"],
        [[data.beneficiary.name, data.beneficiary.email, data.beneficiary.lifecycleStatus, String(data.beneficiary.profileCompletion), `${data.attendanceSummary.rate}%`, String(data.assessments.length)]],
      );
    } finally {
      setGenerating(null);
    }
  };

  const handleCohortExport = async () => {
    if (!selectedCohort) return;
    setGenerating("cohort");
    try {
      const data = await exportCohort({ cohortId: selectedCohort as Id<"cohorts"> });
      downloadCsv(`cohort_${data.cohort.name.replace(/\s+/g, "_")}.csv`,
        ["Name", "Email", "Membership", "Lifecycle", "Profile %", "Attendance %", "Assessments"],
        data.members.map((m) => [m.name, m.email, m.membershipStatus, m.lifecycleStatus, String(m.profileCompletion), `${m.attendanceRate}%`, String(m.assessmentsCompleted)]),
      );
    } finally {
      setGenerating(null);
    }
  };

  const handleFinancialExport = async () => {
    setGenerating("financial");
    try {
      const data = await exportFinancial();
      downloadCsv("financial_report.csv",
        ["Beneficiary", "Category", "Title", "Amount", "Transfer Date", "Evidence Status"],
        data.disbursements.map((d) => [d.beneficiaryName, d.category, d.requestTitle, String(d.amount), d.transferDate, d.evidenceStatus]),
      );
    } finally {
      setGenerating(null);
    }
  };

  const handleAlumniTransition = async (userId: string) => {
    if (!confirm("Transition this beneficiary to alumni? This preserves all records.")) return;
    setGenerating("alumni");
    try {
      await transitionAlumni({ userId: userId as Id<"users"> });
    } finally {
      setGenerating(null);
    }
  };

  if (beneficiaries === undefined || cohorts === undefined) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" /></div>;
  }

  return (
    <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Individual beneficiary report */}
      <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">Individual Report</h2>
        <p className="mt-1 text-xs text-[#737373]">Export a beneficiary&apos;s profile, attendance, and assessment data.</p>
        <div className="mt-4">
          <Select
            value={selectedBeneficiary}
            onChange={setSelectedBeneficiary}
            placeholder="Select beneficiary"
            options={[
              { label: "Select beneficiary", value: "" },
              ...beneficiaries.map((b) => ({
                label: b.firstName && b.lastName ? `${b.firstName} ${b.lastName}` : b.user?.name || "Unnamed",
                value: b.userId,
              })),
            ]}
          />
        </div>
        <button onClick={handleBeneficiaryExport} disabled={!selectedBeneficiary || generating === "beneficiary"}
          className="mt-3 w-full rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white hover:bg-[#262626] disabled:opacity-50">
          {generating === "beneficiary" ? "Generating..." : "Export CSV"}
        </button>
      </div>

      {/* Cohort report */}
      <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">Cohort Report</h2>
        <p className="mt-1 text-xs text-[#737373]">Export all members of a cohort with summary metrics.</p>
        <div className="mt-4">
          <Select
            value={selectedCohort}
            onChange={setSelectedCohort}
            placeholder="Select cohort"
            options={[
              { label: "Select cohort", value: "" },
              ...cohorts.map((c) => ({
                label: c.name,
                value: c._id,
              })),
            ]}
          />
        </div>
        <button onClick={handleCohortExport} disabled={!selectedCohort || generating === "cohort"}
          className="mt-3 w-full rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white hover:bg-[#262626] disabled:opacity-50">
          {generating === "cohort" ? "Generating..." : "Export CSV"}
        </button>
      </div>

      {/* Financial report */}
      <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">Financial Report</h2>
        <p className="mt-1 text-xs text-[#737373]">Export all disbursements. Bank references are redacted.</p>
        <button onClick={handleFinancialExport} disabled={generating === "financial"}
          className="mt-4 w-full rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white hover:bg-[#262626] disabled:opacity-50">
          {generating === "financial" ? "Generating..." : "Export CSV"}
        </button>
      </div>

      {/* Alumni transition */}
      <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">Alumni Transition</h2>
        <p className="mt-1 text-xs text-[#737373]">Move a beneficiary to alumni status. Historical records are preserved.</p>
        <div className="mt-4 space-y-2">
          {beneficiaries
            .filter((b) => b.lifecycleStatus !== "alumni")
            .slice(0, 10)
            .map((b) => (
              <div key={b._id} className="flex items-center justify-between gap-2 rounded-lg border border-[#F0F0F0] px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm text-[#171717]">{b.firstName && b.lastName ? `${b.firstName} ${b.lastName}` : b.user?.name || "Unnamed"}</p>
                  <p className="text-xs text-[#737373]">{b.lifecycleStatus}</p>
                </div>
                <button onClick={() => handleAlumniTransition(b.userId)} disabled={generating === "alumni"}
                  className="rounded-md bg-[#F0F0F0] px-3 py-1 text-xs font-medium text-[#525252] hover:bg-[#E5E5E5] disabled:opacity-50">
                  To Alumni
                </button>
              </div>
            ))}
          {beneficiaries.filter((b) => b.lifecycleStatus !== "alumni").length === 0 && (
            <p className="text-sm text-[#737373]">No eligible beneficiaries.</p>
          )}
        </div>
      </div>
    </div>
  );
}

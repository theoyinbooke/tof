"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";
import { useState } from "react";
import { Select } from "@/components/ui/select";
import {
  ErrorToast,
  SuccessToast,
  useMutationWithError,
} from "@/components/ui/mutation-error-toast";

const STATUSES = ["all", "submitted", "under_review", "approved", "disbursed", "evidence_requested", "evidence_submitted", "verified", "declined", "closed"];
const CATEGORIES = [
  { label: "Tuition", value: "tuition" },
  { label: "Books", value: "books" },
  { label: "Transport", value: "transport" },
  { label: "Medical", value: "medical" },
  { label: "Accommodation", value: "accommodation" },
  { label: "Upkeep", value: "upkeep" },
  { label: "Other", value: "other" },
] as const;

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
type Category =
  | "tuition"
  | "books"
  | "transport"
  | "medical"
  | "accommodation"
  | "upkeep"
  | "other";

export default function AdminSupportPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    beneficiaryUserId: "",
    description: "",
    category: "other" as Category,
    amount: "",
  });
  const requests = useQuery(api.support.listWithBeneficiaries, {
    status: statusFilter === "all" ? undefined : statusFilter as Status,
  });
  const beneficiaries = useQuery(api.users.listByRole, { role: "beneficiary" });
  const createRequest = useMutation(api.support.createForBeneficiary);
  const { error, clearError, handleError } = useMutationWithError();

  if (requests === undefined || beneficiaries === undefined) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" /></div>;
  }

  const beneficiaryOptions = beneficiaries.map((beneficiary) => ({
    label: beneficiary.name,
    value: beneficiary._id,
  }));

  const handleSubmit = async () => {
    setSaving(true);
    clearError();
    try {
      await createRequest({
        beneficiaryUserId: form.beneficiaryUserId as never,
        description: form.description,
        category: form.category,
        amountRequested: form.amount ? parseFloat(form.amount) : undefined,
      });
      setForm({
        beneficiaryUserId: "",
        description: "",
        category: "other",
        amount: "",
      });
      setShowForm(false);
      setSuccessMessage("Support request created successfully.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-10">
      {successMessage && (
        <SuccessToast message={successMessage} onClose={() => setSuccessMessage(null)} />
      )}
      {error && <ErrorToast message={error} onClose={clearError} />}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-semibold text-[#171717]">Support Requests</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white hover:bg-[#262626]"
        >
          {showForm ? "Cancel" : "+ New Support"}
        </button>
      </div>

      {showForm && (
        <div className="mt-4 rounded-xl border border-[#E5E5E5] bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm text-[#262626]">Beneficiary</label>
              <Select
                value={form.beneficiaryUserId}
                onChange={(value) => setForm({ ...form, beneficiaryUserId: value })}
                options={beneficiaryOptions}
                placeholder="Select beneficiary"
                searchable
                searchPlaceholder="Search beneficiaries..."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm text-[#262626]">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Describe the support being assigned and any useful context."
                className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:border-[#171717]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#262626]">Category</label>
              <Select
                value={form.category}
                onChange={(value) => setForm({ ...form, category: value as Category })}
                options={[...CATEGORIES]}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#262626]">Amount (₦)</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm outline-none focus:border-[#171717]"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={
                saving ||
                !form.beneficiaryUserId ||
                !form.description
              }
              className="rounded-md bg-[#00D632] px-4 py-2 text-sm font-medium text-white hover:bg-[#00C02D] disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Support Request"}
            </button>
          </div>
        </div>
      )}

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
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[#171717] truncate">{r.title}</p>
                <p className="text-xs text-[#737373] truncate">{r.beneficiary?.name || "Unknown"} · {r.category} {r.amountRequested ? `· ₦${r.amountRequested.toLocaleString()}` : ""}</p>
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

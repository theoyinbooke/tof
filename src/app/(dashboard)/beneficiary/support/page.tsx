"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";
import { useState } from "react";
import { Select } from "@/components/ui/select";

type Category = "tuition" | "books" | "transport" | "medical" | "accommodation" | "other";

const CATEGORIES: { label: string; value: Category }[] = [
  { label: "Tuition", value: "tuition" },
  { label: "Books", value: "books" },
  { label: "Transport", value: "transport" },
  { label: "Medical", value: "medical" },
  { label: "Accommodation", value: "accommodation" },
  { label: "Other", value: "other" },
];

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

export default function BeneficiarySupportPage() {
  const requests = useQuery(api.support.getMyRequests);
  const createRequest = useMutation(api.support.create);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "other" as Category, amount: "" });

  if (requests === undefined) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" /></div>;
  }

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await createRequest({
        title: form.title,
        description: form.description,
        category: form.category,
        amountRequested: form.amount ? parseFloat(form.amount) : undefined,
      });
      setForm({ title: "", description: "", category: "other", amount: "" });
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#171717]">Support Requests</h1>
        <button onClick={() => setShowForm(!showForm)} className="rounded-md bg-[#00D632] px-4 py-2 text-sm font-medium text-white hover:bg-[#00C02D]">
          {showForm ? "Cancel" : "+ New Request"}
        </button>
      </div>

      {showForm && (
        <div className="mt-4 rounded-xl border border-[#E5E5E5] bg-white p-6">
          <div className="space-y-4">
            <div><label className="mb-1.5 block text-sm text-[#262626]">Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm outline-none focus:border-[#171717]" /></div>
            <div><label className="mb-1.5 block text-sm text-[#262626]">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:border-[#171717]" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm text-[#262626]">Category</label>
                <Select
                  value={form.category}
                  onChange={(val) => setForm({ ...form, category: val as Category })}
                  options={CATEGORIES}
                />
              </div>
              <div><label className="mb-1.5 block text-sm text-[#262626]">Amount (₦)</label><input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm outline-none focus:border-[#171717]" /></div>
            </div>
            <div className="flex justify-end">
              <button onClick={handleSubmit} disabled={saving || !form.title || !form.description} className="rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white hover:bg-[#262626] disabled:opacity-50">
                {saving ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white py-16">
          <h2 className="text-base font-semibold text-[#171717]">No requests</h2>
          <p className="mt-1 text-sm text-[#737373]">Submit a support request when you need help.</p>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
          {requests.map((r, i) => (
            <Link key={r._id} href={`/beneficiary/support/${r._id}`} className={`flex items-center justify-between px-4 py-3 text-sm hover:bg-[#F7F7F7] ${i > 0 ? "border-t border-[#F0F0F0]" : ""}`}>
              <div>
                <p className="font-medium text-[#171717]">{r.title}</p>
                <p className="text-xs text-[#737373]">{r.category} {r.amountRequested ? `· ₦${r.amountRequested.toLocaleString()}` : ""}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status] || "bg-[#F0F0F0] text-[#737373]"}`}>{r.status.replace(/_/g, " ")}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

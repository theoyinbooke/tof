"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { use, useState } from "react";
import Link from "next/link";

const ADMIN_ACTIONS: Record<string, { label: string; toStatus: string; style: string }[]> = {
  submitted: [
    { label: "Start Review", toStatus: "under_review", style: "bg-yellow-500 text-white" },
    { label: "Decline", toStatus: "declined", style: "bg-[#EF4444] text-white" },
  ],
  under_review: [
    { label: "Approve", toStatus: "approved", style: "bg-[#00D632] text-white" },
    { label: "Decline", toStatus: "declined", style: "bg-[#EF4444] text-white" },
  ],
  disbursed: [
    { label: "Request Evidence", toStatus: "evidence_requested", style: "bg-yellow-500 text-white" },
    { label: "Verify", toStatus: "verified", style: "bg-[#00D632] text-white" },
  ],
  evidence_submitted: [
    { label: "Verify", toStatus: "verified", style: "bg-[#00D632] text-white" },
    { label: "Request Again", toStatus: "evidence_requested", style: "bg-yellow-500 text-white" },
  ],
  verified: [
    { label: "Close", toStatus: "closed", style: "bg-[#171717] text-white" },
  ],
};

type Status = "draft" | "submitted" | "under_review" | "approved" | "declined" | "disbursed" | "evidence_requested" | "evidence_submitted" | "verified" | "closed";

export default function AdminSupportDetailPage({ params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = use(params);
  const id = requestId as Id<"supportRequests">;
  const data = useQuery(api.support.getById, { requestId: id });
  const transitionFn = useMutation(api.support.transition);
  const disburseFn = useMutation(api.disbursements.create);

  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const [showDisburse, setShowDisburse] = useState(false);
  const [disburseForm, setDisburseForm] = useState({ amount: "", bankReference: "" });

  if (data === undefined) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" /></div>;
  }

  if (!data) {
    return <div className="p-6 lg:p-10"><Link href="/admin/support" className="text-sm text-[#737373]">&larr; Back</Link><p className="mt-8 text-center">Not found.</p></div>;
  }

  const actions = ADMIN_ACTIONS[data.status] || [];

  const handleTransition = async (toStatus: string) => {
    setSaving(true);
    try {
      await transitionFn({ requestId: id, toStatus: toStatus as Status, note: note || undefined });
      setNote("");
    } finally {
      setSaving(false);
    }
  };

  const handleDisburse = async () => {
    setSaving(true);
    try {
      await disburseFn({
        requestId: id,
        amount: parseFloat(disburseForm.amount),
        bankReference: disburseForm.bankReference || undefined,
        evidenceDueDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      });
      setShowDisburse(false);
      setDisburseForm({ amount: "", bankReference: "" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <Link href="/admin/support" className="text-sm text-[#737373] hover:text-[#171717]">&larr; Back</Link>

      <div className="mt-4">
        <h1 className="text-xl font-semibold text-[#171717]">{data.title}</h1>
        <p className="mt-1 text-sm text-[#737373]">By {data.beneficiary?.name || "Unknown"} · {data.category} · ₦{(data.amountRequested || 0).toLocaleString()}</p>
      </div>

      <p className="mt-3 text-sm text-[#262626]">{data.description}</p>

      {/* Actions */}
      <div className="mt-6 rounded-xl border border-[#E5E5E5] bg-white p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#F0F0F0] px-3 py-1 text-xs font-medium text-[#525252]">Status: {data.status.replace(/_/g, " ")}</span>
          {actions.map((a) => (
            <button key={a.toStatus} onClick={() => handleTransition(a.toStatus)} disabled={saving}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${a.style} disabled:opacity-50`}>
              {a.label}
            </button>
          ))}
          {data.status === "approved" && (
            <button onClick={() => setShowDisburse(!showDisburse)} className="rounded-md bg-purple-600 px-3 py-1.5 text-xs font-medium text-white">
              Disburse
            </button>
          )}
        </div>
        <div className="mt-3">
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note (optional)" className="h-9 w-full max-w-sm rounded-lg border border-[#E5E5E5] px-3 text-xs outline-none focus:border-[#171717]" />
        </div>

        {showDisburse && (
          <div className="mt-4 rounded-lg border border-[#E5E5E5] p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div><label className="mb-1 block text-xs text-[#737373]">Amount (₦)</label><input type="number" value={disburseForm.amount} onChange={(e) => setDisburseForm({ ...disburseForm, amount: e.target.value })} className="h-9 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm outline-none focus:border-[#171717]" /></div>
              <div><label className="mb-1 block text-xs text-[#737373]">Bank Reference</label><input value={disburseForm.bankReference} onChange={(e) => setDisburseForm({ ...disburseForm, bankReference: e.target.value })} className="h-9 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm outline-none focus:border-[#171717]" /></div>
            </div>
            <button onClick={handleDisburse} disabled={saving || !disburseForm.amount} className="mt-3 rounded-md bg-[#171717] px-4 py-2 text-xs font-medium text-white disabled:opacity-50">
              {saving ? "Processing..." : "Record Disbursement"}
            </button>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="mt-6 rounded-xl border border-[#E5E5E5] bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">Event History</h2>
        {data.events.length === 0 ? (
          <p className="mt-4 text-sm text-[#737373]">No events.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {data.events.map((e) => (
              <div key={e._id} className="border-l-2 border-[#E5E5E5] pl-3">
                <p className="text-xs font-medium text-[#171717]">{e.action}</p>
                {e.note && <p className="text-xs text-[#737373]">{e.note}</p>}
                <p className="text-[10px] text-[#D4D4D4]">{new Date(e.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Disbursements */}
      {data.disbursements.length > 0 && (
        <div className="mt-6 rounded-xl border border-[#E5E5E5] bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">Disbursements</h2>
          <div className="mt-4 space-y-2">
            {data.disbursements.map((d) => (
              <div key={d._id} className="flex items-center justify-between rounded-lg border border-[#F0F0F0] px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#171717]">₦{d.amount.toLocaleString()}</p>
                  <p className="text-xs text-[#737373] truncate">Ref: {d.bankReference || "N/A"} · {new Date(d.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${d.evidenceStatus === "verified" ? "bg-[#E6FBF0] text-[#00D632]" : d.evidenceStatus === "overdue" ? "bg-red-50 text-red-600" : "bg-[#F0F0F0] text-[#737373]"}`}>
                  {d.evidenceStatus.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";
import { useState } from "react";

type Status = "draft" | "published" | "archived";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-yellow-50 text-yellow-600",
  published: "bg-[#E6FBF0] text-[#00D632]",
  archived: "bg-[#F0F0F0] text-[#737373]",
};

export default function AdminAssessmentsPage() {
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const templates = useQuery(api.assessments.templates.list, {
    status: statusFilter === "all" ? undefined : statusFilter,
  });
  const createTemplate = useMutation(api.assessments.templates.create);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", shortCode: "", description: "" });

  if (templates === undefined) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" /></div>;
  }

  const handleCreate = async () => {
    setSaving(true);
    try {
      await createTemplate({
        name: form.name,
        shortCode: form.shortCode,
        description: form.description || undefined,
        items: [],
      });
      setForm({ name: "", shortCode: "", description: "" });
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#171717]">Assessment Templates</h1>
        <button onClick={() => setShowForm(!showForm)} className="rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white hover:bg-[#262626]">
          {showForm ? "Cancel" : "+ New Template"}
        </button>
      </div>

      {showForm && (
        <div className="mt-4 rounded-xl border border-[#E5E5E5] bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1.5 block text-sm text-[#262626]">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm outline-none focus:border-[#171717]" /></div>
            <div><label className="mb-1.5 block text-sm text-[#262626]">Short Code</label><input value={form.shortCode} onChange={(e) => setForm({ ...form, shortCode: e.target.value })} placeholder="e.g., PHQ-9" className="h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm outline-none focus:border-[#171717]" /></div>
          </div>
          <div className="mt-4"><label className="mb-1.5 block text-sm text-[#262626]">Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm outline-none focus:border-[#171717]" /></div>
          <div className="mt-4 flex justify-end">
            <button onClick={handleCreate} disabled={saving || !form.name || !form.shortCode} className="rounded-md bg-[#00D632] px-4 py-2 text-sm font-medium text-white hover:bg-[#00C02D] disabled:opacity-50">
              {saving ? "Creating..." : "Create Draft"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {(["all", "draft", "published", "archived"] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === s ? "bg-[#171717] text-white" : "bg-[#F0F0F0] text-[#525252] hover:bg-[#E5E5E5]"}`}>
            {s === "all" ? "All" : s[0].toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {templates.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white py-16">
          <h2 className="text-base font-semibold text-[#171717]">No templates</h2>
          <p className="mt-1 text-sm text-[#737373]">Create an assessment template to get started.</p>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
          {templates.map((t, i) => (
            <Link key={t._id} href={`/admin/assessments/${t._id}`}
              className={`flex items-center justify-between px-4 py-3 text-sm hover:bg-[#F7F7F7] ${i > 0 ? "border-t border-[#F0F0F0]" : ""}`}>
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-10 items-center justify-center rounded bg-[#F0F0F0] text-[10px] font-bold text-[#525252]">{t.shortCode}</span>
                <div>
                  <p className="font-medium text-[#171717]">{t.name}</p>
                  <p className="text-xs text-[#737373]">v{t.version} · {t.items.length} items · {t.pillar?.replace("_", " ") || "No pillar"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[t.status]}`}>{t.status}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#D4D4D4" strokeWidth="1.5" strokeLinecap="round"><path d="M5 3l4 4-4 4" /></svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

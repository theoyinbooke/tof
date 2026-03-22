"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState } from "react";

export default function AdminCohortsPage() {
  const overview = useQuery(api.analytics.getCohortOverview);
  const createCohort = useMutation(api.cohorts.create);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  if (overview === undefined) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" /></div>;
  }

  const handleCreate = async () => {
    setSaving(true);
    try {
      await createCohort({ name: form.name, description: form.description || undefined });
      setForm({ name: "", description: "" });
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#171717]">Cohorts</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white hover:bg-[#262626]">
          {showForm ? "Cancel" : "+ New Cohort"}
        </button>
      </div>

      {showForm && (
        <div className="mt-4 rounded-xl border border-[#E5E5E5] bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1.5 block text-sm text-[#262626]">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm outline-none focus:border-[#171717]" /></div>
            <div><label className="mb-1.5 block text-sm text-[#262626]">Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm outline-none focus:border-[#171717]" /></div>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={handleCreate} disabled={saving || !form.name} className="rounded-md bg-[#00D632] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              {saving ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      )}

      {overview.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white py-16">
          <h2 className="text-base font-semibold text-[#171717]">No cohorts</h2>
          <p className="mt-1 text-sm text-[#737373]">Create your first cohort.</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {overview.map((c) => (
            <div key={c._id} className="rounded-xl border border-[#E5E5E5] bg-white p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#171717]">{c.name}</h3>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${c.isActive ? "bg-[#E6FBF0] text-[#00D632]" : "bg-[#F0F0F0] text-[#737373]"}`}>
                  {c.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {c.description && <p className="mt-1 text-xs text-[#737373]">{c.description}</p>}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-lg font-semibold text-[#171717]">{c.totalMembers}</p>
                  <p className="text-[10px] text-[#737373]">total members</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#00D632]">{c.activeMembers}</p>
                  <p className="text-[10px] text-[#737373]">active</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

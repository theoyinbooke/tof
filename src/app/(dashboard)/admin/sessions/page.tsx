"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";
import { useState } from "react";

export default function AdminSessionsPage() {
  const sessions = useQuery(api.sessions.list, {});
  const createSession = useMutation(api.sessions.create);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    sessionNumber: "",
    title: "",
    pillar: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  if (sessions === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  const handleCreate = async () => {
    setSaving(true);
    try {
      await createSession({
        sessionNumber: parseInt(form.sessionNumber) || 0,
        title: form.title,
        pillar: form.pillar,
        description: form.description || undefined,
      });
      setForm({ sessionNumber: "", title: "", pillar: "", description: "" });
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#171717]">Sessions</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white hover:bg-[#262626]"
        >
          {showForm ? "Cancel" : "+ New Session"}
        </button>
      </div>

      {showForm && (
        <div className="mt-4 rounded-xl border border-[#E5E5E5] bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-[#262626]">Session Number</label>
              <input type="number" value={form.sessionNumber} onChange={(e) => setForm({ ...form, sessionNumber: e.target.value })} className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm outline-none focus:border-[#171717]" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#262626]">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm outline-none focus:border-[#171717]" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#262626]">Pillar</label>
              <select value={form.pillar} onChange={(e) => setForm({ ...form, pillar: e.target.value })} className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm outline-none focus:border-[#171717]">
                <option value="">Select pillar</option>
                <option value="personal_development">Personal Development</option>
                <option value="academic_excellence">Academic Excellence</option>
                <option value="career_readiness">Career Readiness</option>
                <option value="financial_literacy">Financial Literacy</option>
                <option value="health_wellness">Health & Wellness</option>
                <option value="leadership">Leadership</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#262626]">Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm outline-none focus:border-[#171717]" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={handleCreate} disabled={saving || !form.title} className="rounded-md bg-[#00D632] px-4 py-2 text-sm font-medium text-white hover:bg-[#00C02D] disabled:opacity-50">
              {saving ? "Creating..." : "Create Session"}
            </button>
          </div>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white py-16">
          <h2 className="text-base font-semibold text-[#171717]">No sessions</h2>
          <p className="mt-1 text-sm text-[#737373]">Create your first session to get started.</p>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
          {sessions.map((s, i) => (
            <Link
              key={s._id}
              href={`/admin/sessions/${s._id}`}
              className={`flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-[#F7F7F7] ${i > 0 ? "border-t border-[#F0F0F0]" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F0F0] text-xs font-bold text-[#525252]">
                  {s.sessionNumber}
                </span>
                <div>
                  <p className="font-medium text-[#171717]">{s.title}</p>
                  <p className="text-xs text-[#737373]">{s.pillar?.replace("_", " ") || "No pillar"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  s.status === "active" ? "bg-[#E6FBF0] text-[#00D632]" :
                  s.status === "completed" ? "bg-[#F0F0F0] text-[#525252]" :
                  s.status === "upcoming" ? "bg-blue-50 text-blue-600" :
                  "bg-[#F0F0F0] text-[#737373]"
                }`}>
                  {s.status}
                </span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#D4D4D4" strokeWidth="1.5" strokeLinecap="round"><path d="M5 3l4 4-4 4" /></svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

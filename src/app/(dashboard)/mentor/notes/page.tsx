"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState } from "react";
import type { Id } from "../../../../../convex/_generated/dataModel";

type Visibility = "mentor_only" | "mentor_and_admin";

export default function MentorNotesPage() {
  const notes = useQuery(api.mentorNotes.getMyNotes);
  const mentees = useQuery(api.mentorAssignments.getMyMentees);
  const createNote = useMutation(api.mentorNotes.create);
  const deleteNote = useMutation(api.mentorNotes.remove);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    beneficiaryUserId: "" as string,
    content: "",
    visibility: "mentor_and_admin" as Visibility,
  });

  if (notes === undefined || mentees === undefined) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" /></div>;
  }

  const handleCreate = async () => {
    if (!form.beneficiaryUserId || !form.content) return;
    setSaving(true);
    try {
      await createNote({
        beneficiaryUserId: form.beneficiaryUserId as Id<"users">,
        content: form.content,
        visibility: form.visibility,
      });
      setForm({ beneficiaryUserId: "", content: "", visibility: "mentor_and_admin" });
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (noteId: typeof notes[0]["_id"]) => {
    await deleteNote({ noteId });
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#171717]">Mentor Notes</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white hover:bg-[#262626]">
          {showForm ? "Cancel" : "+ New Note"}
        </button>
      </div>

      {showForm && (
        <div className="mt-4 rounded-xl border border-[#E5E5E5] bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-[#262626]">Mentee</label>
              <select value={form.beneficiaryUserId}
                onChange={(e) => setForm({ ...form, beneficiaryUserId: e.target.value })}
                className="h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm outline-none focus:border-[#171717]">
                <option value="">Select mentee</option>
                {mentees.map((m) => (
                  <option key={m.assignment._id} value={m.beneficiary?._id || ""}>
                    {m.beneficiary?.name || "Unknown"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#262626]">Visibility</label>
              <select value={form.visibility}
                onChange={(e) => setForm({ ...form, visibility: e.target.value as Visibility })}
                className="h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm outline-none focus:border-[#171717]">
                <option value="mentor_and_admin">Mentor & Admin</option>
                <option value="mentor_only">Mentor Only</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-sm text-[#262626]">Note</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={4} className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:border-[#171717]" />
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={handleCreate} disabled={saving || !form.beneficiaryUserId || !form.content}
              className="rounded-md bg-[#00D632] px-4 py-2 text-sm font-medium text-white hover:bg-[#00C02D] disabled:opacity-50">
              {saving ? "Saving..." : "Save Note"}
            </button>
          </div>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white py-16">
          <h2 className="text-base font-semibold text-[#171717]">No notes yet</h2>
          <p className="mt-1 text-sm text-[#737373]">Create your first note about a mentee.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {notes.map((n) => (
            <div key={n._id} className="rounded-xl border border-[#E5E5E5] bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E6FBF0] text-xs font-medium text-[#00D632]">
                    {(n.beneficiary?.name?.[0] || "?").toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-[#171717]">{n.beneficiary?.name || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-[#E5E5E5] px-2 py-0.5 text-[10px] text-[#737373]">
                    {n.visibility === "mentor_only" ? "Private" : "Shared"}
                  </span>
                  <button onClick={() => handleDelete(n._id)}
                    className="text-xs text-[#D4D4D4] hover:text-[#EF4444]">Delete</button>
                </div>
              </div>
              <p className="mt-2 text-sm text-[#262626] whitespace-pre-wrap">{n.content}</p>
              <p className="mt-2 text-[10px] text-[#D4D4D4]">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { use, useState } from "react";
import Link from "next/link";

export default function MentorMenteeDetailPage({ params }: { params: Promise<{ beneficiaryId: string }> }) {
  const { beneficiaryId } = use(params);
  const userId = beneficiaryId as Id<"users">;

  const user = useQuery(api.users.getUserById, { userId });
  const scoreSummary = useQuery(api.safeguarding.getScoreSummaryForMentor, { userId });
  const safeguardingActions = useQuery(api.safeguarding.getByUser, { userId });
  const attendance = useQuery(api.attendance.getByUser, { userId });
  const notes = useQuery(api.mentorNotes.listByBeneficiary, { beneficiaryUserId: userId });
  const createNote = useMutation(api.mentorNotes.create);

  const [noteContent, setNoteContent] = useState("");
  const [saving, setSaving] = useState(false);

  const isLoading = user === undefined || scoreSummary === undefined ||
    safeguardingActions === undefined || attendance === undefined || notes === undefined;

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" /></div>;
  }

  if (!user) {
    return <div className="p-6 lg:p-10"><Link href="/mentor/mentees" className="text-sm text-[#737373]">&larr; Back</Link><p className="mt-8 text-center">User not found.</p></div>;
  }

  const presentCount = attendance?.filter((a) => a.status === "present").length ?? 0;
  const totalAttendance = attendance?.length ?? 0;
  const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    setSaving(true);
    try {
      await createNote({
        beneficiaryUserId: userId,
        content: noteContent,
        visibility: "mentor_and_admin",
      });
      setNoteContent("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <Link href="/mentor/mentees" className="text-sm text-[#737373] hover:text-[#171717]">&larr; Back to mentees</Link>

      <div className="mt-4">
        <h1 className="text-xl font-semibold text-[#171717]">{user.name}</h1>
        <p className="mt-1 text-sm text-[#737373]">{user.email}</p>
      </div>

      {/* Safeguarding alerts */}
      {safeguardingActions && safeguardingActions.filter((a) => a.status === "open" || a.status === "in_progress").length > 0 && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <h2 className="text-sm font-semibold text-red-600">Active Safeguarding Actions</h2>
          <div className="mt-2 space-y-1">
            {safeguardingActions.filter((a) => a.status === "open" || a.status === "in_progress").map((a) => (
              <div key={a._id} className="flex items-center justify-between text-xs">
                <span className="text-red-700">{a.template?.shortCode}: {a.score?.severityBand}</span>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-600">{a.status.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Attendance</p>
          <p className="mt-2 text-2xl font-semibold text-[#171717]">{attendanceRate}%</p>
          <p className="mt-0.5 text-xs text-[#737373]">{presentCount}/{totalAttendance} sessions</p>
        </div>

        <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Assessments</p>
          <p className="mt-2 text-2xl font-semibold text-[#171717]">{scoreSummary?.length ?? 0}</p>
          <p className="mt-0.5 text-xs text-[#737373]">completed</p>
        </div>

        <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Notes</p>
          <p className="mt-2 text-2xl font-semibold text-[#171717]">{notes?.length ?? 0}</p>
          <p className="mt-0.5 text-xs text-[#737373]">mentor notes</p>
        </div>
      </div>

      {/* Assessment summary — no item-level data */}
      <div className="mt-6 rounded-xl border border-[#E5E5E5] bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">Assessment Summary</h2>
        {scoreSummary && scoreSummary.length > 0 ? (
          <div className="mt-4 space-y-2">
            {scoreSummary.map((s) => (
              <div key={s._id} className="flex items-center justify-between rounded-lg border border-[#F0F0F0] px-3 py-2">
                <div>
                  <p className="text-sm text-[#171717]">Score: {s.totalScore}</p>
                  <p className="text-xs text-[#737373]">{new Date(s.scoredAt).toLocaleDateString()}</p>
                </div>
                {s.severityBand && (
                  <span className="rounded-full bg-[#F0F0F0] px-2 py-0.5 text-[10px] text-[#525252]">{s.severityBand}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-[#737373]">No completed assessments.</p>
        )}
        <p className="mt-3 text-[10px] text-[#D4D4D4]">Summary scores only. Item-level responses are not available.</p>
      </div>

      {/* Notes section with inline creation */}
      <div className="mt-6 rounded-xl border border-[#E5E5E5] bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">Notes</h2>

        <div className="mt-4">
          <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)}
            rows={3} placeholder="Add a note about this mentee..."
            className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:border-[#171717] placeholder:text-[#D4D4D4]" />
          <div className="mt-2 flex justify-end">
            <button onClick={handleAddNote} disabled={saving || !noteContent.trim()}
              className="rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white hover:bg-[#262626] disabled:opacity-50">
              {saving ? "Saving..." : "Add Note"}
            </button>
          </div>
        </div>

        {notes && notes.length > 0 && (
          <div className="mt-4 space-y-3 border-t border-[#F0F0F0] pt-4">
            {notes.map((n) => (
              <div key={n._id} className="border-l-2 border-[#E5E5E5] pl-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#171717]">{n.mentor?.name || "Unknown"}</span>
                  <span className="rounded-full border border-[#E5E5E5] px-1.5 py-0.5 text-[9px] text-[#737373]">
                    {n.visibility === "mentor_only" ? "Private" : "Shared"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#262626] whitespace-pre-wrap">{n.content}</p>
                <p className="mt-1 text-[10px] text-[#D4D4D4]">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

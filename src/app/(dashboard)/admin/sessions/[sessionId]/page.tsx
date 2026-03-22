"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { use, useState } from "react";
import Link from "next/link";

export default function AdminSessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const id = sessionId as Id<"sessions">;

  const session = useQuery(api.sessions.getById, { sessionId: id });
  const enrollments = useQuery(api.attendance.getEnrollments, { sessionId: id });
  const attendanceRecords = useQuery(api.attendance.getBySession, { sessionId: id });
  const updateSession = useMutation(api.sessions.update);
  const markAttendance = useMutation(api.attendance.markAttendance);

  const [saving, setSaving] = useState(false);

  if (session === undefined || enrollments === undefined || attendanceRecords === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-6 lg:p-10">
        <Link href="/admin/sessions" className="text-sm text-[#737373] hover:text-[#171717]">&larr; Back</Link>
        <div className="mt-8 text-center">
          <h2 className="text-base font-semibold text-[#171717]">Session not found</h2>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (status: string) => {
    setSaving(true);
    try {
      await updateSession({ sessionId: id, status: status as "draft" | "upcoming" | "active" | "completed" | "cancelled" });
    } finally {
      setSaving(false);
    }
  };

  const handleMark = async (userId: Id<"users">, status: "present" | "absent" | "excused") => {
    await markAttendance({ sessionId: id, userId, status });
  };

  const attendanceMap = new Map(attendanceRecords.map((a) => [a.userId as string, a]));

  return (
    <div className="p-6 lg:p-10">
      <Link href="/admin/sessions" className="text-sm text-[#737373] hover:text-[#171717]">&larr; Back to sessions</Link>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#171717]">
            #{session.sessionNumber} — {session.title}
          </h1>
          <p className="mt-1 text-sm text-[#737373]">{session.pillar?.replace("_", " ") || "No pillar"}</p>
        </div>
      </div>

      {/* Status */}
      <div className="mt-4 flex flex-wrap gap-2">
        {["draft", "upcoming", "active", "completed", "cancelled"].map((s) => (
          <button key={s} onClick={() => handleStatusChange(s)} disabled={saving || session.status === s}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${session.status === s ? "bg-[#00D632] text-white" : "bg-[#F0F0F0] text-[#525252] hover:bg-[#E5E5E5] disabled:opacity-50"}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Enrolled & Attendance */}
      <div className="mt-6 rounded-xl border border-[#E5E5E5] bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">
          Roster ({enrollments.length} enrolled)
        </h2>
        {enrollments.length === 0 ? (
          <p className="mt-4 text-sm text-[#737373]">No beneficiaries enrolled yet.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {enrollments.map((e) => {
              const att = attendanceMap.get(e.userId as string);
              return (
                <div key={e._id} className="flex items-center justify-between rounded-lg border border-[#F0F0F0] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E6FBF0] text-xs font-medium text-[#00D632]">
                      {(e.user?.name?.[0] || "?").toUpperCase()}
                    </div>
                    <span className="text-sm text-[#171717]">{e.user?.name || "Unknown"}</span>
                  </div>
                  <div className="flex gap-1">
                    {(["present", "absent", "excused"] as const).map((status) => (
                      <button key={status} onClick={() => handleMark(e.userId, status)}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                          att?.status === status
                            ? status === "present" ? "bg-[#00D632] text-white" : status === "absent" ? "bg-[#EF4444] text-white" : "bg-[#F59E0B] text-white"
                            : "bg-[#F0F0F0] text-[#737373] hover:bg-[#E5E5E5]"
                        }`}>
                        {status[0].toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

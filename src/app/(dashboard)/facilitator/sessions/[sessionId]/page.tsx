"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { use } from "react";
import Link from "next/link";

export default function FacilitatorSessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const id = sessionId as Id<"sessions">;

  const session = useQuery(api.sessions.getById, { sessionId: id });
  const enrollments = useQuery(api.attendance.getEnrollments, { sessionId: id });
  const attendanceRecords = useQuery(api.attendance.getBySession, { sessionId: id });
  const markAttendance = useMutation(api.attendance.markAttendance);

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
        <Link href="/facilitator/sessions" className="text-sm text-[#737373]">&larr; Back</Link>
        <p className="mt-8 text-center text-sm text-[#737373]">Session not found.</p>
      </div>
    );
  }

  const attendanceMap = new Map(attendanceRecords.map((a) => [a.userId as string, a]));

  const handleMark = async (userId: Id<"users">, status: "present" | "absent" | "excused") => {
    await markAttendance({ sessionId: id, userId, status });
  };

  return (
    <div className="p-6 lg:p-10">
      <Link href="/facilitator/sessions" className="text-sm text-[#737373] hover:text-[#171717]">&larr; Back</Link>
      <h1 className="mt-4 text-xl font-semibold text-[#171717]">#{session.sessionNumber} — {session.title}</h1>
      <p className="mt-1 text-sm text-[#737373]">{session.description || "No description"}</p>

      <div className="mt-6 rounded-xl border border-[#E5E5E5] bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">Attendance ({enrollments.length} enrolled)</h2>
        {enrollments.length === 0 ? (
          <p className="mt-4 text-sm text-[#737373]">No one enrolled.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {enrollments.map((e) => {
              const att = attendanceMap.get(e.userId as string);
              return (
                <div key={e._id} className="flex flex-col gap-2 rounded-lg border border-[#F0F0F0] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="min-w-0 truncate text-sm text-[#171717]">{e.user?.name || "Unknown"}</span>
                  <div className="flex shrink-0 gap-1">
                    {(["present", "absent", "excused"] as const).map((status) => (
                      <button key={status} onClick={() => handleMark(e.userId, status)}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium ${att?.status === status ? (status === "present" ? "bg-[#00D632] text-white" : status === "absent" ? "bg-[#EF4444] text-white" : "bg-[#F59E0B] text-white") : "bg-[#F0F0F0] text-[#737373] hover:bg-[#E5E5E5]"}`}>
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

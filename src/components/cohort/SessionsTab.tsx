"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState } from "react";
import Link from "next/link";
import { Select } from "@/components/ui/select";
import {
  SuccessToast,
  ErrorToast,
  useMutationWithError,
} from "@/components/ui/mutation-error-toast";

interface SessionsTabProps {
  cohortId: Id<"cohorts">;
}

type SessionStatus = "draft" | "upcoming" | "active" | "completed" | "cancelled";

const STATUS_FILTERS: { label: string; value: SessionStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
];

const STATUS_BADGE: Record<SessionStatus, { bg: string; text: string }> = {
  draft: { bg: "bg-[#F0F0F0]", text: "text-[#737373]" },
  upcoming: { bg: "bg-blue-50", text: "text-[#3B82F6]" },
  active: { bg: "bg-[#E6FBF0]", text: "text-[#00D632]" },
  completed: { bg: "bg-[#F0F0F0]", text: "text-[#525252]" },
  cancelled: { bg: "bg-red-50", text: "text-[#EF4444]" },
};

const PILLAR_OPTIONS = [
  { label: "Select pillar", value: "" },
  { label: "Spiritual Development", value: "spiritual_development" },
  { label: "Emotional Development", value: "emotional_development" },
  { label: "Financial & Career", value: "financial_career" },
  { label: "Discipleship & Leadership", value: "discipleship_leadership" },
];

function formatDateShort(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function dateInputToTimestamp(dateStr: string): number {
  return new Date(dateStr + "T12:00:00").getTime();
}

export default function SessionsTab({ cohortId }: SessionsTabProps) {
  const sessions = useQuery(api.sessions.listByCohort, { cohortId });
  const facilitators = useQuery(api.users.listByRole, { role: "facilitator" });
  const allSessions = useQuery(api.sessions.list, {});

  const createSession = useMutation(api.sessions.create);
  const updateSession = useMutation(api.sessions.update);
  const enrollCohort = useMutation(api.attendance.enrollCohort);

  const [statusFilter, setStatusFilter] = useState<SessionStatus | "all">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addMode, setAddMode] = useState<"create" | "link">("create");
  const [linkSessionId, setLinkSessionId] = useState("");
  const [enrollingSessionId, setEnrollingSessionId] = useState<string | null>(null);
  const [confirmEnrollId, setConfirmEnrollId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { error, clearError, handleError } = useMutationWithError();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    sessionNumber: "",
    title: "",
    pillar: "",
    scheduledDate: "",
    facilitatorId: "",
  });

  if (sessions === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  // Filter sessions by status
  const filteredSessions =
    statusFilter === "all"
      ? sessions
      : sessions.filter((s) => s.status === statusFilter);

  // Unlinked draft sessions for linking
  const unlinkedDrafts = (allSessions || []).filter(
    (s) => s.status === "draft" && !s.cohortId,
  );

  const unlinkedDraftOptions = [
    { label: "Select a session...", value: "" },
    ...unlinkedDrafts.map((s) => ({
      label: `#${s.sessionNumber} - ${s.title}`,
      value: s._id as string,
    })),
  ];

  const facilitatorOptions = [
    { label: "No facilitator", value: "" },
    ...(facilitators || []).map((f) => ({
      label: `${f.name} (${f.email})`,
      value: f._id as string,
    })),
  ];

  const handleCreate = async () => {
    setSaving(true);
    try {
      await createSession({
        sessionNumber: parseInt(form.sessionNumber) || 0,
        title: form.title,
        pillar: form.pillar,
        scheduledDate: form.scheduledDate
          ? dateInputToTimestamp(form.scheduledDate)
          : undefined,
        facilitatorId: form.facilitatorId
          ? (form.facilitatorId as Id<"users">)
          : undefined,
        cohortId,
      });
      setForm({ sessionNumber: "", title: "", pillar: "", scheduledDate: "", facilitatorId: "" });
      setShowAddForm(false);
      setSuccessMsg("Session created successfully");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleLink = async () => {
    if (!linkSessionId) return;
    setSaving(true);
    try {
      await updateSession({
        sessionId: linkSessionId as Id<"sessions">,
        cohortId,
      });
      setLinkSessionId("");
      setShowAddForm(false);
      setSuccessMsg("Session linked to cohort");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEnrollAll = async (sessionId: string) => {
    setEnrollingSessionId(sessionId);
    try {
      const count = await enrollCohort({
        sessionId: sessionId as Id<"sessions">,
        cohortId,
      });
      setConfirmEnrollId(null);
      setSuccessMsg(`${count} beneficiaries enrolled`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      handleError(err);
    } finally {
      setEnrollingSessionId(null);
    }
  };

  return (
    <div className="space-y-4">
      {successMsg && (
        <SuccessToast message={successMsg} onClose={() => setSuccessMsg(null)} />
      )}
      {error && <ErrorToast message={error} onClose={clearError} />}

      {/* Header Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-[#171717]">Sessions</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white hover:bg-[#262626]"
        >
          {showAddForm ? "Cancel" : "+ Add Session"}
        </button>
      </div>

      {/* Add Session Form */}
      {showAddForm && (
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
          {/* Mode Tabs */}
          <div className="mb-4 flex gap-1 border-b border-[#E5E5E5]">
            <button
              onClick={() => setAddMode("create")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                addMode === "create"
                  ? "border-b-2 border-[#171717] text-[#171717]"
                  : "text-[#737373] hover:text-[#171717]"
              }`}
            >
              Create New
            </button>
            <button
              onClick={() => setAddMode("link")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                addMode === "link"
                  ? "border-b-2 border-[#171717] text-[#171717]"
                  : "text-[#737373] hover:text-[#171717]"
              }`}
            >
              Link Existing
            </button>
          </div>

          {addMode === "create" ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm text-[#262626]">
                    Session Number
                  </label>
                  <input
                    type="number"
                    value={form.sessionNumber}
                    onChange={(e) =>
                      setForm({ ...form, sessionNumber: e.target.value })
                    }
                    className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm outline-none focus:border-[#171717]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-[#262626]">
                    Title
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm outline-none focus:border-[#171717]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-[#262626]">
                    Pillar
                  </label>
                  <Select
                    value={form.pillar}
                    onChange={(val) => setForm({ ...form, pillar: val })}
                    options={PILLAR_OPTIONS}
                    placeholder="Select pillar"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-[#262626]">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    value={form.scheduledDate}
                    onChange={(e) =>
                      setForm({ ...form, scheduledDate: e.target.value })
                    }
                    className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm outline-none focus:border-[#171717]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-[#262626]">
                    Facilitator
                  </label>
                  <Select
                    value={form.facilitatorId}
                    onChange={(val) =>
                      setForm({ ...form, facilitatorId: val })
                    }
                    options={facilitatorOptions}
                    placeholder="Select facilitator"
                    searchable
                    searchPlaceholder="Search facilitators..."
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleCreate}
                  disabled={saving || !form.title}
                  className="rounded-md bg-[#00D632] px-4 py-2 text-sm font-medium text-white hover:bg-[#00C02D] disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create Session"}
                </button>
              </div>
            </>
          ) : (
            <div>
              <p className="mb-3 text-sm text-[#737373]">
                Link an existing draft session to this cohort.
              </p>
              {unlinkedDrafts.length === 0 ? (
                <p className="text-sm text-[#D4D4D4]">
                  No unlinked draft sessions available.
                </p>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label className="mb-1.5 block text-sm text-[#262626]">
                      Select Session
                    </label>
                    <Select
                      value={linkSessionId}
                      onChange={setLinkSessionId}
                      options={unlinkedDraftOptions}
                      placeholder="Select a session..."
                      searchable
                      searchPlaceholder="Search sessions..."
                    />
                  </div>
                  <button
                    onClick={handleLink}
                    disabled={saving || !linkSessionId}
                    className="rounded-md bg-[#00D632] px-4 py-2 text-sm font-medium text-white hover:bg-[#00C02D] disabled:opacity-50"
                  >
                    {saving ? "Linking..." : "Link Session"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Status Filter Row */}
      <div className="flex gap-1 overflow-x-auto">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === f.value
                ? "bg-[#171717] text-white"
                : "bg-[#F0F0F0] text-[#737373] hover:bg-[#E5E5E5]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Sessions Table / Card List */}
      {filteredSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E6FBF0]">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00D632"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <h3 className="mt-4 text-base font-semibold text-[#171717]">
            {statusFilter !== "all"
              ? `No ${statusFilter} sessions`
              : "No sessions yet"}
          </h3>
          <p className="mt-1 text-sm text-[#737373]">
            {statusFilter !== "all"
              ? "Try a different filter."
              : "Add sessions to this cohort to get started."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-hidden rounded-xl border border-[#E5E5E5] bg-white sm:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F0F0F0] text-left text-xs font-medium uppercase tracking-wider text-[#737373]">
                    <th className="px-4 py-3 w-12">#</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3 hidden md:table-cell">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Facilitator</th>
                    <th className="px-4 py-3">Enrolled</th>
                    <th className="px-4 py-3">Attendance %</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((s) => {
                    const badge = STATUS_BADGE[s.status as SessionStatus];
                    const attendanceColor =
                      s.attendanceRate > 80
                        ? "text-[#00D632]"
                        : s.attendanceRate > 50
                          ? "text-[#F59E0B]"
                          : "text-[#EF4444]";

                    return (
                      <tr
                        key={s._id}
                        className="border-b border-[#F0F0F0] last:border-0 transition-colors hover:bg-[#F7F7F7]"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-[#525252]">
                          {s.sessionNumber}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-[#171717]">
                            {s.title}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-sm text-[#737373]">
                          {s.scheduledDate
                            ? formatDateShort(s.scheduledDate)
                            : "Not set"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-sm text-[#737373]">
                          {s.facilitatorName || "Unassigned"}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#171717]">
                          {s.enrolledCount} enrolled
                        </td>
                        <td className="px-4 py-3">
                          {s.enrolledCount > 0 ? (
                            <span className={`text-sm font-medium ${attendanceColor}`}>
                              {s.attendanceRate}%
                            </span>
                          ) : (
                            <span className="text-sm text-[#D4D4D4]">&mdash;</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {confirmEnrollId === s._id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEnrollAll(s._id)}
                                  disabled={enrollingSessionId === s._id}
                                  className="rounded-md bg-[#00D632] px-2 py-1 text-[10px] font-medium text-white hover:bg-[#00C02D] disabled:opacity-50"
                                >
                                  {enrollingSessionId === s._id
                                    ? "..."
                                    : "Confirm"}
                                </button>
                                <button
                                  onClick={() => setConfirmEnrollId(null)}
                                  className="rounded-md px-2 py-1 text-[10px] font-medium text-[#737373] hover:text-[#171717]"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmEnrollId(s._id)}
                                className="rounded-md border border-[#E5E5E5] bg-white px-2.5 py-1 text-[11px] font-medium text-[#262626] hover:bg-[#F7F7F7]"
                              >
                                Enroll All
                              </button>
                            )}
                            <Link
                              href={`/admin/sessions/${s._id}`}
                              className="rounded-md border border-[#E5E5E5] bg-white px-2.5 py-1 text-[11px] font-medium text-[#262626] hover:bg-[#F7F7F7]"
                            >
                              View
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List */}
          <div className="space-y-3 sm:hidden">
            {filteredSessions.map((s) => {
              const badge = STATUS_BADGE[s.status as SessionStatus];
              const attendanceColor =
                s.attendanceRate > 80
                  ? "text-[#00D632]"
                  : s.attendanceRate > 50
                    ? "text-[#F59E0B]"
                    : "text-[#EF4444]";

              return (
                <div
                  key={s._id}
                  className="rounded-xl border border-[#E5E5E5] bg-white p-4"
                >
                  {/* Header: number + title + status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F0F0F0] text-xs font-bold text-[#525252]">
                          {s.sessionNumber}
                        </span>
                        <p className="truncate text-sm font-medium text-[#171717]">
                          {s.title}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}
                    >
                      {s.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-[#737373]">Date</p>
                      <p className="font-medium text-[#262626]">
                        {s.scheduledDate
                          ? formatDateShort(s.scheduledDate)
                          : "Not set"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#737373]">Facilitator</p>
                      <p className="font-medium text-[#262626]">
                        {s.facilitatorName || "Unassigned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#737373]">Enrolled</p>
                      <p className="font-medium text-[#262626]">
                        {s.enrolledCount} enrolled
                      </p>
                    </div>
                    <div>
                      <p className="text-[#737373]">Attendance</p>
                      {s.enrolledCount > 0 ? (
                        <p className={`font-medium ${attendanceColor}`}>
                          {s.attendanceRate}%
                        </p>
                      ) : (
                        <p className="text-[#D4D4D4]">&mdash;</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex items-center gap-2 border-t border-[#F0F0F0] pt-3">
                    {confirmEnrollId === s._id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEnrollAll(s._id)}
                          disabled={enrollingSessionId === s._id}
                          className="rounded-md bg-[#00D632] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                        >
                          {enrollingSessionId === s._id ? "..." : "Confirm Enroll"}
                        </button>
                        <button
                          onClick={() => setConfirmEnrollId(null)}
                          className="rounded-md px-3 py-1.5 text-xs font-medium text-[#737373]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmEnrollId(s._id)}
                        className="rounded-md border border-[#E5E5E5] bg-white px-3 py-1.5 text-xs font-medium text-[#262626] hover:bg-[#F7F7F7]"
                      >
                        Enroll All
                      </button>
                    )}
                    <Link
                      href={`/admin/sessions/${s._id}`}
                      className="rounded-md border border-[#E5E5E5] bg-white px-3 py-1.5 text-xs font-medium text-[#262626] hover:bg-[#F7F7F7]"
                    >
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

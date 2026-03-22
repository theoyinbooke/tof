"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { use, useState } from "react";
import Link from "next/link";
import { Select } from "@/components/ui/select";
import {
  SuccessToast,
  ErrorToast,
  useMutationWithError,
} from "@/components/ui/mutation-error-toast";

const PILLAR_OPTIONS = [
  { label: "Spiritual Development", value: "spiritual_development" },
  { label: "Emotional Development", value: "emotional_development" },
  { label: "Financial & Career", value: "financial_career" },
  { label: "Discipleship & Leadership", value: "discipleship_leadership" },
];

const STATUS_OPTIONS = ["draft", "upcoming", "active", "completed", "cancelled"] as const;

function formatDateDisplay(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function timestampToDateInput(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toISOString().split("T")[0];
}

function dateInputToTimestamp(dateStr: string): number {
  return new Date(dateStr + "T12:00:00").getTime();
}

export default function AdminSessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const id = sessionId as Id<"sessions">;

  const session = useQuery(api.sessions.getById, { sessionId: id });
  const enrollments = useQuery(api.attendance.getEnrollments, {
    sessionId: id,
  });
  const attendanceRecords = useQuery(api.attendance.getBySession, {
    sessionId: id,
  });
  const facilitators = useQuery(api.users.listByRole, {
    role: "facilitator",
  });
  const cohorts = useQuery(api.cohorts.listActive);
  const publishedTemplates = useQuery(api.assessments.templates.list, {
    status: "published",
  });
  const sessionAssignments = useQuery(
    api.assessments.assignments.listBySession,
    { sessionId: id }
  );

  const updateSession = useMutation(api.sessions.update);
  const markAttendance = useMutation(api.attendance.markAttendance);
  const enrollCohort = useMutation(api.attendance.enrollCohort);
  const assignToSession = useMutation(
    api.assessments.assignments.assignToSession
  );

  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { error, clearError, handleError } = useMutationWithError();

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPillar, setEditPillar] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editFacilitatorId, setEditFacilitatorId] = useState("");
  const [editCohortId, setEditCohortId] = useState("");

  // Assessment assignment state
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [assessmentDueDate, setAssessmentDueDate] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Enrollment state
  const [enrolling, setEnrolling] = useState(false);
  const [showEnrollConfirm, setShowEnrollConfirm] = useState(false);

  if (
    session === undefined ||
    enrollments === undefined ||
    attendanceRecords === undefined
  ) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-6 lg:p-10">
        <Link
          href="/admin/sessions"
          className="text-sm text-[#737373] hover:text-[#171717]"
        >
          &larr; Back
        </Link>
        <div className="mt-8 text-center">
          <h2 className="text-base font-semibold text-[#171717]">
            Session not found
          </h2>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (status: string) => {
    setSaving(true);
    try {
      await updateSession({
        sessionId: id,
        status: status as (typeof STATUS_OPTIONS)[number],
      });
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleMark = async (
    userId: Id<"users">,
    status: "present" | "absent" | "excused"
  ) => {
    try {
      await markAttendance({ sessionId: id, userId, status });
    } catch (err) {
      handleError(err);
    }
  };

  const startEditing = () => {
    setEditTitle(session.title);
    setEditDescription(session.description || "");
    setEditPillar(session.pillar || "");
    setEditDate(
      session.scheduledDate ? timestampToDateInput(session.scheduledDate) : ""
    );
    setEditFacilitatorId(
      session.facilitatorId ? (session.facilitatorId as string) : ""
    );
    setEditCohortId(session.cohortId ? (session.cohortId as string) : "");
    setEditMode(true);
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const updates: Record<string, unknown> = { sessionId: id };
      if (editTitle !== session.title) updates.title = editTitle;
      if (editDescription !== (session.description || ""))
        updates.description = editDescription;
      if (editPillar !== (session.pillar || "")) updates.pillar = editPillar;
      if (editDate) {
        const newTs = dateInputToTimestamp(editDate);
        if (newTs !== session.scheduledDate) updates.scheduledDate = newTs;
      }
      if (
        editFacilitatorId !==
        (session.facilitatorId ? (session.facilitatorId as string) : "")
      ) {
        if (editFacilitatorId) {
          updates.facilitatorId = editFacilitatorId as Id<"users">;
        }
      }
      if (
        editCohortId !==
        (session.cohortId ? (session.cohortId as string) : "")
      ) {
        if (editCohortId) {
          updates.cohortId = editCohortId as Id<"cohorts">;
        }
      }

      // Only update if there are real changes
      if (Object.keys(updates).length > 1) {
        await updateSession(
          updates as Parameters<typeof updateSession>[0]
        );
        showSuccess("Session updated successfully");
      }
      setEditMode(false);
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEnrollCohort = async () => {
    if (!session.cohortId) return;
    setEnrolling(true);
    try {
      const count = await enrollCohort({
        sessionId: id,
        cohortId: session.cohortId,
      });
      showSuccess(`Enrolled ${count} new member${count !== 1 ? "s" : ""}`);
      setShowEnrollConfirm(false);
    } catch (err) {
      handleError(err);
    } finally {
      setEnrolling(false);
    }
  };

  const handleAssignAssessment = async () => {
    if (!selectedTemplateId) return;
    setAssigning(true);
    try {
      const count = await assignToSession({
        templateId: selectedTemplateId as Id<"assessmentTemplates">,
        sessionId: id,
        dueDate: assessmentDueDate
          ? dateInputToTimestamp(assessmentDueDate)
          : undefined,
      });
      showSuccess(
        `Assessment assigned to ${count} enrolled beneficiar${count !== 1 ? "ies" : "y"}`
      );
      setSelectedTemplateId("");
      setAssessmentDueDate("");
    } catch (err) {
      handleError(err);
    } finally {
      setAssigning(false);
    }
  };

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  }

  const attendanceMap = new Map(
    attendanceRecords.map((a) => [a.userId as string, a])
  );

  const facilitatorOptions = [
    { label: "Select facilitator", value: "" },
    ...(facilitators || []).map((f) => ({
      label: `${f.name} (${f.email})`,
      value: f._id as string,
    })),
  ];

  const cohortOptions = [
    { label: "Select cohort", value: "" },
    ...(cohorts || []).map((c) => ({
      label: c.name,
      value: c._id as string,
    })),
  ];

  const templateOptions = [
    { label: "Select assessment", value: "" },
    ...(publishedTemplates || []).map((t) => ({
      label: `${t.name} (${t.shortCode})`,
      value: t._id as string,
    })),
  ];

  return (
    <div className="p-6 lg:p-10">
      {successMsg && (
        <SuccessToast
          message={successMsg}
          onClose={() => setSuccessMsg(null)}
        />
      )}
      {error && <ErrorToast message={error} onClose={clearError} />}

      <Link
        href="/admin/sessions"
        className="text-sm text-[#737373] hover:text-[#171717]"
      >
        &larr; Back to sessions
      </Link>

      {/* Header */}
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-[#171717]">
            #{session.sessionNumber} — {session.title}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#737373]">
            <span className="capitalize">
              {session.pillar?.replace(/_/g, " ") || "No pillar"}
            </span>
            {session.scheduledDate && (
              <span>{formatDateDisplay(session.scheduledDate)}</span>
            )}
            {session.facilitator && (
              <span>Facilitator: {session.facilitator.name}</span>
            )}
            {session.cohort && <span>Cohort: {session.cohort.name}</span>}
          </div>
        </div>
        {!editMode && (
          <button
            onClick={startEditing}
            className="shrink-0 rounded-md border border-[#E5E5E5] bg-white px-3 py-1.5 text-sm font-medium text-[#262626] transition-colors hover:bg-[#F7F7F7]"
          >
            Edit
          </button>
        )}
      </div>

      {/* Status */}
      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => handleStatusChange(s)}
            disabled={saving || session.status === s}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              session.status === s
                ? "bg-[#00D632] text-white"
                : "bg-[#F0F0F0] text-[#525252] hover:bg-[#E5E5E5] disabled:opacity-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* A. Session Edit Form */}
      {editMode && (
        <div className="mt-4 rounded-xl border border-[#E5E5E5] bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">
            Edit Session
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-[#262626]">
                Title
              </label>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm outline-none focus:border-[#171717]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#262626]">
                Pillar
              </label>
              <Select
                value={editPillar}
                onChange={setEditPillar}
                options={PILLAR_OPTIONS}
                placeholder="Select pillar"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm text-[#262626]">
                Description
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-sm outline-none focus:border-[#171717]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#262626]">
                Scheduled Date
              </label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm outline-none focus:border-[#171717]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#262626]">
                Facilitator
              </label>
              <Select
                value={editFacilitatorId}
                onChange={setEditFacilitatorId}
                options={facilitatorOptions}
                placeholder="Select facilitator"
                searchable
                searchPlaceholder="Search facilitators..."
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#262626]">
                Cohort
              </label>
              <Select
                value={editCohortId}
                onChange={setEditCohortId}
                options={cohortOptions}
                placeholder="Select cohort"
                searchable
                searchPlaceholder="Search cohorts..."
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setEditMode(false)}
              className="rounded-md px-4 py-2 text-sm font-medium text-[#525252] transition-colors hover:bg-[#F0F0F0]"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={saving || !editTitle}
              className="rounded-md bg-[#00D632] px-4 py-2 text-sm font-medium text-white hover:bg-[#00C02D] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* B. Enrollment Management */}
      <div className="mt-6 rounded-xl border border-[#E5E5E5] bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">
            Roster ({enrollments.length} enrolled)
          </h2>
          {session.cohortId && (
            <div className="relative">
              {showEnrollConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#737373]">
                    Enroll all cohort members?
                  </span>
                  <button
                    onClick={handleEnrollCohort}
                    disabled={enrolling}
                    className="rounded-md bg-[#00D632] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#00C02D] disabled:opacity-50"
                  >
                    {enrolling ? "Enrolling..." : "Confirm"}
                  </button>
                  <button
                    onClick={() => setShowEnrollConfirm(false)}
                    className="rounded-md px-3 py-1.5 text-xs font-medium text-[#525252] hover:bg-[#F0F0F0]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowEnrollConfirm(true)}
                  className="rounded-md border border-[#E5E5E5] bg-white px-3 py-1.5 text-xs font-medium text-[#262626] transition-colors hover:bg-[#F7F7F7]"
                >
                  Enroll All Cohort Members
                </button>
              )}
            </div>
          )}
        </div>
        {enrollments.length === 0 ? (
          <p className="mt-4 text-sm text-[#737373]">
            No beneficiaries enrolled yet.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {enrollments.map((e) => {
              const att = attendanceMap.get(e.userId as string);
              return (
                <div
                  key={e._id}
                  className="flex items-center justify-between rounded-lg border border-[#F0F0F0] px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E6FBF0] text-xs font-medium text-[#00D632]">
                      {(e.user?.name?.[0] || "?").toUpperCase()}
                    </div>
                    <span className="text-sm text-[#171717]">
                      {e.user?.name || "Unknown"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {(["present", "absent", "excused"] as const).map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => handleMark(e.userId, status)}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                            att?.status === status
                              ? status === "present"
                                ? "bg-[#00D632] text-white"
                                : status === "absent"
                                  ? "bg-[#EF4444] text-white"
                                  : "bg-[#F59E0B] text-white"
                              : "bg-[#F0F0F0] text-[#737373] hover:bg-[#E5E5E5]"
                          }`}
                        >
                          {status[0].toUpperCase() + status.slice(1)}
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* C. Assessment Assignment */}
      <div className="mt-6 rounded-xl border border-[#E5E5E5] bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">
          Assessment Assignment
        </h2>

        {/* Already assigned assessments */}
        {sessionAssignments && sessionAssignments.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-[#525252]">
              Assigned Assessments
            </p>
            <div className="space-y-2">
              {sessionAssignments.map((a) => (
                <div
                  key={a.templateId}
                  className="flex items-center justify-between rounded-lg border border-[#F0F0F0] px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-xs font-medium text-blue-600">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm text-[#171717]">
                        {a.templateName}
                      </span>
                      <span className="ml-2 text-xs text-[#737373]">
                        ({a.count} assigned)
                      </span>
                    </div>
                  </div>
                  {a.dueDate && (
                    <span className="text-xs text-[#737373]">
                      Due: {formatDateDisplay(a.dueDate)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assign new assessment */}
        <div className="mt-4 rounded-lg border border-dashed border-[#E5E5E5] p-4">
          <p className="mb-3 text-xs font-medium text-[#525252]">
            Assign New Assessment
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <Select
                value={selectedTemplateId}
                onChange={setSelectedTemplateId}
                options={templateOptions}
                placeholder="Select assessment"
                searchable
                searchPlaceholder="Search assessments..."
              />
            </div>
            <div className="sm:col-span-1">
              <input
                type="date"
                value={assessmentDueDate}
                onChange={(e) => setAssessmentDueDate(e.target.value)}
                placeholder="Due date (optional)"
                className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm outline-none focus:border-[#171717]"
              />
            </div>
            <div className="sm:col-span-1">
              <button
                onClick={handleAssignAssessment}
                disabled={assigning || !selectedTemplateId}
                className="h-11 w-full rounded-lg bg-[#171717] px-4 text-sm font-medium text-white transition-colors hover:bg-[#262626] disabled:opacity-50"
              >
                {assigning ? "Assigning..." : "Assign to All Enrolled"}
              </button>
            </div>
          </div>
          {enrollments.length === 0 && (
            <p className="mt-2 text-xs text-[#F59E0B]">
              No beneficiaries enrolled. Enroll members before assigning
              assessments.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

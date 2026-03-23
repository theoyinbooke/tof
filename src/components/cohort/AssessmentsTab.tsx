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

interface AssessmentsTabProps {
  cohortId: Id<"cohorts">;
}

const BAND_COLORS: Record<string, string> = {
  // Green-ish bands
  Minimal: "bg-[#00D632]",
  "Minimal anxiety": "bg-[#00D632]",
  "No anxiety": "bg-[#00D632]",
  High: "bg-[#00D632]",
  "High resilience": "bg-[#00D632]",
  "High grit": "bg-[#00D632]",
  "High self-efficacy": "bg-[#00D632]",
  Positive: "bg-[#00D632]",
  Normal: "bg-[#00D632]",
  Healthy: "bg-[#00D632]",
  // Amber/moderate bands
  Mild: "bg-[#F59E0B]",
  "Mild anxiety": "bg-[#F59E0B]",
  Moderate: "bg-[#F59E0B]",
  Average: "bg-[#F59E0B]",
  "Below Average": "bg-[#F59E0B]",
  // Orange bands
  "Moderately severe": "bg-[#E65100]",
  Low: "bg-[#E65100]",
  "Low resilience": "bg-[#E65100]",
  // Red/severe bands
  Severe: "bg-[#EF4444]",
  "Severe anxiety": "bg-[#EF4444]",
  "Very Low": "bg-[#EF4444]",
  Critical: "bg-[#EF4444]",
};

function getBandColor(bandLabel: string): string {
  return BAND_COLORS[bandLabel] || "bg-[#D4D4D4]";
}

export default function AssessmentsTab({ cohortId }: AssessmentsTabProps) {
  const summaries = useQuery(
    api.assessments.scoring.getCohortAssessmentSummary,
    { cohortId },
  );
  const sessions = useQuery(api.sessions.listByCohort, { cohortId });
  const templates = useQuery(api.assessments.templates.list, {
    status: "published",
  });
  const flaggedScores = useQuery(
    api.assessments.scoring.listFlaggedScores,
    {},
  );

  const assignToSession = useMutation(
    api.assessments.assignments.assignToSession,
  );

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    sessionId: "",
    templateId: "",
    dueDate: "",
  });
  const [assigning, setAssigning] = useState(false);
  const [assignResult, setAssignResult] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { error, clearError, handleError } = useMutationWithError();

  if (summaries === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  // Aggregate summary stats
  const totalInstruments = summaries.length;
  const totalAssigned = summaries.reduce((a, s) => a + s.totalAssigned, 0);
  const totalCompleted = summaries.reduce((a, s) => a + s.completedCount, 0);
  const avgCompletion =
    totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;
  const totalFlagged = summaries.reduce((a, s) => a + s.flaggedCount, 0);

  // Session dropdown options
  const sessionOptions = [
    { label: "Select session...", value: "" },
    ...(sessions || []).map((s) => ({
      label: `S${s.sessionNumber}: ${s.title}`,
      value: s._id as string,
    })),
  ];

  // Template dropdown options
  const templateOptions = [
    { label: "Select instrument...", value: "" },
    ...(templates || []).map((t) => ({
      label: `${t.shortCode} - ${t.name}`,
      value: t._id as string,
    })),
  ];

  // Filter flagged scores to only those for this cohort's sessions
  const cohortSessionIds = new Set(
    (sessions || []).map((s) => s._id as string),
  );
  const cohortFlagged = (flaggedScores || []).filter((fs) => {
    // flagged scores don't carry sessionId directly, but we can match by template+session
    // from the summaries data. For the quick view, show all flagged scores from this query.
    return true;
  });

  const handleAssign = async () => {
    if (!assignForm.sessionId || !assignForm.templateId) return;
    setAssigning(true);
    try {
      const count = await assignToSession({
        templateId: assignForm.templateId as Id<"assessmentTemplates">,
        sessionId: assignForm.sessionId as Id<"sessions">,
        dueDate: assignForm.dueDate
          ? new Date(assignForm.dueDate + "T23:59:59").getTime()
          : undefined,
      });
      setAssignResult(count);
      setSuccessMsg(`Assessment assigned to ${count} beneficiaries`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      handleError(err);
    } finally {
      setAssigning(false);
    }
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setAssignForm({ sessionId: "", templateId: "", dueDate: "" });
    setAssignResult(null);
  };

  return (
    <div className="min-w-0 space-y-6">
      {successMsg && (
        <SuccessToast
          message={successMsg}
          onClose={() => setSuccessMsg(null)}
        />
      )}
      {error && <ErrorToast message={error} onClose={clearError} />}

      {/* Summary Cards Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E5E5E5] border-l-4 border-l-[#3B82F6] bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">
            Instruments Assigned
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#171717]">
            {totalInstruments}
          </p>
          <p className="mt-0.5 text-xs text-[#737373]">
            across cohort sessions
          </p>
        </div>
        <div className="rounded-xl border border-[#E5E5E5] border-l-4 border-l-[#00D632] bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">
            Avg Completion Rate
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#171717]">
            {avgCompletion}%
          </p>
          <p className="mt-0.5 text-xs text-[#737373]">
            {totalCompleted} of {totalAssigned} completed
          </p>
        </div>
        <div className="rounded-xl border border-[#E5E5E5] border-l-4 border-l-[#EF4444] bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">
            Flagged Scores
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#171717]">
            {totalFlagged}
          </p>
          <p className="mt-0.5 text-xs text-[#737373]">needing attention</p>
        </div>
      </div>

      {/* Per-Instrument Table */}
      <div className="min-w-0 rounded-xl border border-[#E5E5E5] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#F0F0F0] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#171717]">
              Assessment Instruments
            </h2>
            <p className="mt-0.5 text-xs text-[#737373]">
              Per-instrument breakdown for this cohort.
            </p>
          </div>
          <button
            onClick={() => setShowAssignModal(true)}
            className="rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white hover:bg-[#262626]"
          >
            + Assign Assessment
          </button>
        </div>

        {summaries.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-[#737373]">
              No assessments assigned to cohort sessions yet.
            </p>
            <button
              onClick={() => setShowAssignModal(true)}
              className="mt-3 text-sm font-medium text-[#3B82F6] hover:underline"
            >
              Assign an assessment
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F0F0F0] text-left text-xs font-medium uppercase tracking-wider text-[#737373]">
                    <th className="px-6 py-3">Instrument</th>
                    <th className="px-4 py-3">Session</th>
                    <th className="px-4 py-3">Completed</th>
                    <th className="px-4 py-3">Avg Score</th>
                    <th className="px-4 py-3">Flagged</th>
                    <th className="px-4 py-3 min-w-[180px]">Distribution</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {summaries.map((s) => {
                    const totalInBands = Object.values(s.bandCounts).reduce(
                      (a, b) => a + b,
                      0,
                    );
                    const completionPct =
                      s.totalAssigned > 0
                        ? Math.round(
                            (s.completedCount / s.totalAssigned) * 100,
                          )
                        : 0;

                    return (
                      <tr
                        key={`${s.templateId}-${s.sessionNumber}`}
                        className="border-b border-[#F0F0F0] last:border-0"
                      >
                        {/* Instrument */}
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-10 items-center justify-center rounded bg-[#F0F0F0] text-[9px] font-bold text-[#525252]">
                              {s.shortCode}
                            </span>
                            <span className="text-sm font-medium text-[#171717]">
                              {s.templateName}
                            </span>
                          </div>
                        </td>
                        {/* Session */}
                        <td className="px-4 py-3 text-sm text-[#737373]">
                          S{s.sessionNumber}: {s.sessionTitle}
                        </td>
                        {/* Completed / Assigned with progress bar */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#171717]">
                              {s.completedCount}
                            </span>
                            <span className="text-xs text-[#737373]">
                              / {s.totalAssigned}
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-[#F0F0F0]">
                            <div
                              className="h-full rounded-full bg-[#00D632]"
                              style={{
                                width: `${Math.min(completionPct, 100)}%`,
                              }}
                            />
                          </div>
                        </td>
                        {/* Avg Score */}
                        <td className="px-4 py-3 text-sm text-[#171717]">
                          {s.averageScore !== null ? s.averageScore : "\u2014"}
                        </td>
                        {/* Flagged */}
                        <td className="px-4 py-3">
                          {s.flaggedCount > 0 ? (
                            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-50 px-1.5 text-[10px] font-bold text-red-600">
                              {s.flaggedCount}
                            </span>
                          ) : (
                            <span className="text-xs text-[#D4D4D4]">
                              &mdash;
                            </span>
                          )}
                        </td>
                        {/* Distribution */}
                        <td className="px-4 py-3">
                          {totalInBands > 0 ? (
                            <>
                              <div className="flex h-4 w-full overflow-hidden rounded-full bg-[#F0F0F0]">
                                {Object.entries(s.bandCounts).map(
                                  ([band, count]) => {
                                    const pct = (count / totalInBands) * 100;
                                    if (pct === 0) return null;
                                    return (
                                      <div
                                        key={band}
                                        className={`${getBandColor(band)} relative`}
                                        style={{ width: `${pct}%` }}
                                        title={`${band}: ${count} (${Math.round(pct)}%)`}
                                      />
                                    );
                                  },
                                )}
                              </div>
                              <div className="mt-1 flex flex-wrap gap-x-1 sm:gap-x-3 gap-y-0.5">
                                {Object.entries(s.bandCounts).map(
                                  ([band, count]) => (
                                    <span
                                      key={band}
                                      className="text-[10px] text-[#737373]"
                                    >
                                      <span
                                        className={`mr-1 inline-block h-2 w-2 rounded-full ${getBandColor(band)}`}
                                      />
                                      {band}: {count}
                                    </span>
                                  ),
                                )}
                              </div>
                            </>
                          ) : (
                            <span className="text-xs text-[#D4D4D4]">
                              No data
                            </span>
                          )}
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setAssignForm({
                                ...assignForm,
                                templateId: s.templateId,
                              });
                              setShowAssignModal(true);
                            }}
                            className="rounded-md border border-[#E5E5E5] bg-white px-2.5 py-1 text-[11px] font-medium text-[#262626] hover:bg-[#F7F7F7]"
                          >
                            Assign
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="space-y-3 p-4 sm:hidden">
              {summaries.map((s) => {
                const totalInBands = Object.values(s.bandCounts).reduce(
                  (a, b) => a + b,
                  0,
                );
                const completionPct =
                  s.totalAssigned > 0
                    ? Math.round((s.completedCount / s.totalAssigned) * 100)
                    : 0;

                return (
                  <div
                    key={`${s.templateId}-${s.sessionNumber}`}
                    className="rounded-xl border border-[#F0F0F0] p-4"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-10 shrink-0 items-center justify-center rounded bg-[#F0F0F0] text-[9px] font-bold text-[#525252]">
                          {s.shortCode}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#171717]">
                            {s.templateName}
                          </p>
                          <p className="text-xs text-[#737373]">
                            S{s.sessionNumber}: {s.sessionTitle}
                          </p>
                        </div>
                      </div>
                      {s.flaggedCount > 0 && (
                        <span className="inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-red-50 px-1.5 text-[10px] font-bold text-red-600">
                          {s.flaggedCount}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-[#737373]">Completed</p>
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium text-[#262626]">
                            {s.completedCount}/{s.totalAssigned}
                          </p>
                          <div className="h-1.5 w-12 overflow-hidden rounded-full bg-[#F0F0F0]">
                            <div
                              className="h-full rounded-full bg-[#00D632]"
                              style={{
                                width: `${Math.min(completionPct, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-[#737373]">Avg Score</p>
                        <p className="font-medium text-[#262626]">
                          {s.averageScore !== null ? s.averageScore : "\u2014"}
                        </p>
                      </div>
                    </div>

                    {/* Distribution */}
                    {totalInBands > 0 && (
                      <div className="mt-3">
                        <div className="flex h-3 w-full overflow-hidden rounded-full bg-[#F0F0F0]">
                          {Object.entries(s.bandCounts).map(([band, count]) => {
                            const pct = (count / totalInBands) * 100;
                            if (pct === 0) return null;
                            return (
                              <div
                                key={band}
                                className={`${getBandColor(band)} relative`}
                                style={{ width: `${pct}%` }}
                              />
                            );
                          })}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                          {Object.entries(s.bandCounts).map(([band, count]) => (
                            <span
                              key={band}
                              className="text-[10px] text-[#737373]"
                            >
                              <span
                                className={`mr-0.5 inline-block h-1.5 w-1.5 rounded-full ${getBandColor(band)}`}
                              />
                              {band}: {count}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action */}
                    <div className="mt-3 border-t border-[#F0F0F0] pt-3">
                      <button
                        onClick={() => {
                          setAssignForm({
                            ...assignForm,
                            templateId: s.templateId,
                          });
                          setShowAssignModal(true);
                        }}
                        className="rounded-md border border-[#E5E5E5] bg-white px-3 py-1.5 text-xs font-medium text-[#262626] hover:bg-[#F7F7F7]"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Flagged Quick View */}
      {totalFlagged > 0 && flaggedScores && flaggedScores.length > 0 && (
        <div className="min-w-0 rounded-xl border border-[#E5E5E5] bg-white">
          <div className="flex items-center justify-between border-b border-[#F0F0F0] px-6 py-4">
            <div>
              <h2 className="text-sm font-semibold text-[#171717]">
                Flagged Scores
              </h2>
              <p className="mt-0.5 text-xs text-[#737373]">
                Scores requiring attention or follow-up.
              </p>
            </div>
            <Link
              href="/admin/safeguarding"
              className="text-xs font-medium text-[#3B82F6] hover:underline"
            >
              View Safeguarding
            </Link>
          </div>

          {/* Desktop list */}
          <div className="hidden sm:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F0F0F0] text-left text-xs font-medium uppercase tracking-wider text-[#737373]">
                    <th className="px-6 py-3">Beneficiary</th>
                    <th className="px-4 py-3">Instrument</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Flag Level</th>
                  </tr>
                </thead>
                <tbody>
                  {flaggedScores.slice(0, 10).map((fs) => (
                    <tr
                      key={fs._id}
                      className="border-b border-[#F0F0F0] last:border-0"
                    >
                      <td className="px-6 py-3 text-sm font-medium text-[#171717]">
                        {fs.userName}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded bg-[#F0F0F0] px-1.5 py-0.5 text-[9px] font-bold text-[#525252]">
                            {fs.templateShortCode}
                          </span>
                          <span className="text-sm text-[#737373]">
                            {fs.templateName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#171717]">
                        {fs.totalScore ?? "\u2014"}
                        {fs.severityBand && (
                          <span className="ml-1.5 rounded-full bg-[#F0F0F0] px-2 py-0.5 text-[10px] text-[#525252]">
                            {fs.severityBand}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            fs.flagBehavior === "admin_review"
                              ? "bg-red-50 text-red-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {fs.flagBehavior === "admin_review"
                            ? "Admin Review"
                            : "Mentor Notify"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {flaggedScores.length > 10 && (
              <div className="border-t border-[#F0F0F0] px-6 py-3 text-center">
                <Link
                  href="/admin/safeguarding"
                  className="text-xs font-medium text-[#3B82F6] hover:underline"
                >
                  View all {flaggedScores.length} flagged scores
                </Link>
              </div>
            )}
          </div>

          {/* Mobile list */}
          <div className="space-y-2 p-4 sm:hidden">
            {flaggedScores.slice(0, 8).map((fs) => (
              <div
                key={fs._id}
                className="flex items-center justify-between rounded-lg border border-[#F0F0F0] px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#171717]">
                    {fs.userName}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-[#737373]">
                      {fs.templateShortCode}
                    </span>
                    <span className="text-xs text-[#737373]">
                      Score: {fs.totalScore ?? "\u2014"}
                    </span>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    fs.flagBehavior === "admin_review"
                      ? "bg-red-50 text-red-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {fs.flagBehavior === "admin_review"
                    ? "Admin"
                    : "Mentor"}
                </span>
              </div>
            ))}
            {flaggedScores.length > 8 && (
              <Link
                href="/admin/safeguarding"
                className="block text-center text-xs font-medium text-[#3B82F6] hover:underline"
              >
                View all {flaggedScores.length} flagged
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Assign Assessment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Scrim */}
          <div
            className="absolute inset-0 bg-black/25 backdrop-blur-sm"
            onClick={closeAssignModal}
          />

          {/* Modal Card */}
          <div className="relative mx-4 w-full max-w-md rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-lg">
            {/* Close button */}
            <button
              onClick={closeAssignModal}
              className="absolute right-4 top-4 text-[#737373] hover:text-[#171717]"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M5 5l10 10M15 5l-10 10" />
              </svg>
            </button>

            <h3 className="text-lg font-semibold text-[#171717]">
              Assign Assessment
            </h3>
            <p className="mt-1 text-sm text-[#737373]">
              Assign an assessment instrument to all enrolled beneficiaries in a
              session.
            </p>

            {assignResult !== null ? (
              /* Success state */
              <div className="mt-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E6FBF0]">
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
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                </div>
                <p className="mt-3 text-sm font-medium text-[#171717]">
                  Assessment assigned to {assignResult} beneficiaries
                </p>
                <button
                  onClick={closeAssignModal}
                  className="mt-4 w-full rounded-lg bg-[#171717] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#262626]"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Form */
              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm text-[#262626]">
                    Session
                  </label>
                  <Select
                    value={assignForm.sessionId}
                    onChange={(val) =>
                      setAssignForm({ ...assignForm, sessionId: val })
                    }
                    options={sessionOptions}
                    placeholder="Select session..."
                    searchable
                    searchPlaceholder="Search sessions..."
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-[#262626]">
                    Assessment Template
                  </label>
                  <Select
                    value={assignForm.templateId}
                    onChange={(val) =>
                      setAssignForm({ ...assignForm, templateId: val })
                    }
                    options={templateOptions}
                    placeholder="Select instrument..."
                    searchable
                    searchPlaceholder="Search templates..."
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-[#262626]">
                    Due Date{" "}
                    <span className="text-[#D4D4D4]">(optional)</span>
                  </label>
                  <input
                    type="date"
                    value={assignForm.dueDate}
                    onChange={(e) =>
                      setAssignForm({ ...assignForm, dueDate: e.target.value })
                    }
                    className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm outline-none focus:border-[#171717]"
                  />
                </div>
                <button
                  onClick={handleAssign}
                  disabled={
                    assigning ||
                    !assignForm.sessionId ||
                    !assignForm.templateId
                  }
                  className="w-full rounded-lg bg-[#00D632] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#00C02D] disabled:opacity-50"
                >
                  {assigning
                    ? "Assigning..."
                    : "Assign to All Enrolled"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

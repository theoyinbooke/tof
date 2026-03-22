"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import Link from "next/link";
import { useState } from "react";
import { Select } from "@/components/ui/select";
import {
  SuccessToast,
  ErrorToast,
  useMutationWithError,
} from "@/components/ui/mutation-error-toast";

const PILLAR_OPTIONS = [
  { label: "Select pillar", value: "" },
  { label: "Spiritual Development", value: "spiritual_development" },
  { label: "Emotional Development", value: "emotional_development" },
  { label: "Financial & Career", value: "financial_career" },
  { label: "Discipleship & Leadership", value: "discipleship_leadership" },
];

const STATUS_FILTER_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Draft", value: "draft" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

type SessionStatus = "draft" | "upcoming" | "active" | "completed" | "cancelled";

function formatDateShort(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function timestampToDateInput(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toISOString().split("T")[0];
}

function dateInputToTimestamp(dateStr: string): number {
  return new Date(dateStr + "T12:00:00").getTime();
}

export default function AdminSessionsPage() {
  const [statusFilter, setStatusFilter] = useState<SessionStatus | "">("");

  const sessions = useQuery(
    api.sessions.list,
    statusFilter ? { status: statusFilter as SessionStatus } : {}
  );
  const facilitators = useQuery(api.users.listByRole, {
    role: "facilitator",
  });
  const cohorts = useQuery(api.cohorts.listActive);
  const createSession = useMutation(api.sessions.create);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    sessionNumber: "",
    title: "",
    pillar: "",
    description: "",
    scheduledDate: "",
    facilitatorId: "",
    cohortId: "",
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { error, clearError, handleError } = useMutationWithError();

  if (sessions === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  const facilitatorOptions = [
    { label: "No facilitator", value: "" },
    ...(facilitators || []).map((f) => ({
      label: `${f.name} (${f.email})`,
      value: f._id as string,
    })),
  ];

  const cohortOptions = [
    { label: "No cohort", value: "" },
    ...(cohorts || []).map((c) => ({
      label: c.name,
      value: c._id as string,
    })),
  ];

  const handleCreate = async () => {
    setSaving(true);
    try {
      await createSession({
        sessionNumber: parseInt(form.sessionNumber) || 0,
        title: form.title,
        pillar: form.pillar,
        description: form.description || undefined,
        scheduledDate: form.scheduledDate
          ? dateInputToTimestamp(form.scheduledDate)
          : undefined,
        facilitatorId: form.facilitatorId
          ? (form.facilitatorId as Id<"users">)
          : undefined,
        cohortId: form.cohortId
          ? (form.cohortId as Id<"cohorts">)
          : undefined,
      });
      setForm({
        sessionNumber: "",
        title: "",
        pillar: "",
        description: "",
        scheduledDate: "",
        facilitatorId: "",
        cohortId: "",
      });
      setShowForm(false);
      setSuccessMsg("Session created successfully");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-10">
      {successMsg && (
        <SuccessToast
          message={successMsg}
          onClose={() => setSuccessMsg(null)}
        />
      )}
      {error && <ErrorToast message={error} onClose={clearError} />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-[#171717]">Sessions</h1>
        <div className="flex items-center gap-2">
          <div className="w-40">
            <Select
              value={statusFilter}
              onChange={(val) => setStatusFilter(val as SessionStatus | "")}
              options={STATUS_FILTER_OPTIONS}
              placeholder="All Statuses"
              variant="compact"
            />
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white hover:bg-[#262626]"
          >
            {showForm ? "Cancel" : "+ New Session"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mt-4 rounded-xl border border-[#E5E5E5] bg-white p-6">
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
                onChange={(e) => setForm({ ...form, title: e.target.value })}
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
                onChange={(val) => setForm({ ...form, facilitatorId: val })}
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
                value={form.cohortId}
                onChange={(val) => setForm({ ...form, cohortId: val })}
                options={cohortOptions}
                placeholder="Select cohort"
                searchable
                searchPlaceholder="Search cohorts..."
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1.5 block text-sm text-[#262626]">
                Description
              </label>
              <input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm outline-none focus:border-[#171717]"
                placeholder="Optional description"
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
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white py-16">
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
          <h2 className="mt-4 text-base font-semibold text-[#171717]">
            {statusFilter ? `No ${statusFilter} sessions` : "No sessions"}
          </h2>
          <p className="mt-1 text-sm text-[#737373]">
            {statusFilter
              ? "Try a different status filter."
              : "Create your first session to get started."}
          </p>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
          {/* Table header - hidden on mobile */}
          <div className="hidden border-b border-[#F0F0F0] px-4 py-2.5 sm:flex">
            <span className="w-12 text-xs font-medium uppercase tracking-wider text-[#737373]">
              #
            </span>
            <span className="flex-1 text-xs font-medium uppercase tracking-wider text-[#737373]">
              Title
            </span>
            <span className="hidden w-28 text-xs font-medium uppercase tracking-wider text-[#737373] md:block">
              Date
            </span>
            <span className="hidden w-32 text-xs font-medium uppercase tracking-wider text-[#737373] lg:block">
              Facilitator
            </span>
            <span className="hidden w-28 text-xs font-medium uppercase tracking-wider text-[#737373] lg:block">
              Cohort
            </span>
            <span className="w-24 text-right text-xs font-medium uppercase tracking-wider text-[#737373]">
              Status
            </span>
          </div>

          {sessions.map((s, i) => (
            <Link
              key={s._id}
              href={`/admin/sessions/${s._id}`}
              className={`flex flex-col gap-2 px-4 py-3 text-sm transition-colors hover:bg-[#F7F7F7] sm:flex-row sm:items-center sm:gap-0 ${
                i > 0 ? "border-t border-[#F0F0F0]" : ""
              }`}
            >
              {/* Mobile: session number + title inline */}
              <div className="flex flex-1 items-center gap-3 sm:gap-0">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F0F0F0] text-xs font-bold text-[#525252] sm:mr-3 sm:h-auto sm:w-12 sm:justify-start sm:rounded-none sm:bg-transparent">
                  <span className="sm:hidden">{s.sessionNumber}</span>
                  <span className="hidden sm:inline">{s.sessionNumber}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[#171717]">
                    {s.title}
                  </p>
                  <p className="truncate text-xs text-[#737373] sm:hidden">
                    {s.pillar?.replace(/_/g, " ") || "No pillar"}
                    {s.scheduledDate &&
                      ` \u00B7 ${formatDateShort(s.scheduledDate)}`}
                  </p>
                </div>
              </div>

              {/* Desktop columns */}
              <span className="hidden w-28 text-xs text-[#737373] md:block">
                {s.scheduledDate ? formatDateShort(s.scheduledDate) : "--"}
              </span>
              <span className="hidden w-32 truncate text-xs text-[#737373] lg:block">
                {s.facilitatorName || "--"}
              </span>
              <span className="hidden w-28 truncate text-xs text-[#737373] lg:block">
                {s.cohortName || "--"}
              </span>

              {/* Status badge - always visible */}
              <div className="flex items-center justify-between sm:w-24 sm:justify-end">
                {/* Mobile: show extra info */}
                <div className="flex items-center gap-2 sm:hidden">
                  {s.facilitatorName && (
                    <span className="text-xs text-[#737373]">
                      {s.facilitatorName}
                    </span>
                  )}
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    s.status === "active"
                      ? "bg-[#E6FBF0] text-[#00D632]"
                      : s.status === "completed"
                        ? "bg-[#F0F0F0] text-[#525252]"
                        : s.status === "upcoming"
                          ? "bg-blue-50 text-blue-600"
                          : s.status === "cancelled"
                            ? "bg-red-50 text-[#EF4444]"
                            : "bg-[#F0F0F0] text-[#737373]"
                  }`}
                >
                  {s.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

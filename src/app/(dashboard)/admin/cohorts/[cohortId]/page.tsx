"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { use, useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  SuccessToast,
  ErrorToast,
  useMutationWithError,
} from "@/components/ui/mutation-error-toast";
import { Select } from "@/components/ui/select";
import SessionsTab from "@/components/cohort/SessionsTab";
import AssessmentsTab from "@/components/cohort/AssessmentsTab";
import CalendarTab from "@/components/cohort/CalendarTab";

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

type TabId = "overview" | "members" | "sessions" | "assessments" | "calendar";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "members", label: "Members" },
  { id: "sessions", label: "Sessions" },
  { id: "assessments", label: "Assessments" },
  { id: "calendar", label: "Calendar" },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active: { bg: "bg-[#E6FBF0]", text: "text-[#00D632]" },
  applicant: { bg: "bg-blue-50", text: "text-blue-600" },
  paused: { bg: "bg-amber-50", text: "text-amber-600" },
  completed: { bg: "bg-purple-50", text: "text-purple-600" },
  alumni: { bg: "bg-[#F0F0F0]", text: "text-[#737373]" },
  withdrawn: { bg: "bg-red-50", text: "text-red-600" },
};

const PILLAR_CONFIG: Record<string, { label: string; color: string }> = {
  spiritual_development: { label: "Spiritual Development", color: "#8B5CF6" },
  emotional_development: { label: "Emotional Development", color: "#F59E0B" },
  financial_career: { label: "Financial & Career", color: "#3B82F6" },
  discipleship_leadership: {
    label: "Discipleship & Leadership",
    color: "#00D632",
  },
};

const MEMBER_STATUSES = [
  "applicant",
  "active",
  "paused",
  "completed",
  "alumni",
  "withdrawn",
] as const;

export default function CohortDetailPage({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const { cohortId: cohortIdStr } = use(params);
  const cohortId = cohortIdStr as Id<"cohorts">;

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const cohortStats = useQuery(api.cohorts.getWithStats, { cohortId });

  if (cohortStats === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  if (!cohortStats) {
    return (
      <div className="p-6 lg:p-10">
        <Link
          href="/admin/cohorts"
          className="text-sm text-[#737373] hover:text-[#171717]"
        >
          &larr; Back to Cohorts
        </Link>
        <p className="mt-8 text-center text-sm text-[#737373]">
          Cohort not found.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      {successMsg && (
        <SuccessToast
          message={successMsg}
          onClose={() => setSuccessMsg(null)}
        />
      )}

      {/* Back link */}
      <Link
        href="/admin/cohorts"
        className="mb-4 inline-flex items-center gap-1 text-sm text-[#737373] hover:text-[#171717]"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 4l-4 4 4 4" />
        </svg>
        Back to Cohorts
      </Link>

      {/* Tab bar */}
      <div className="flex overflow-x-auto border-b border-[#E5E5E5] gap-0 -mx-6 px-6 lg:-mx-10 lg:px-10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-[#00D632] text-[#171717]"
                : "border-transparent text-[#737373] hover:text-[#262626]"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === "overview" && (
          <OverviewTab
            cohortStats={cohortStats}
            cohortId={cohortId}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onSuccess={(msg) => {
              setSuccessMsg(msg);
              setTimeout(() => setSuccessMsg(null), 3000);
            }}
          />
        )}
        {activeTab === "members" && (
          <MembersTab
            cohortId={cohortId}
            onSuccess={(msg) => {
              setSuccessMsg(msg);
              setTimeout(() => setSuccessMsg(null), 3000);
            }}
          />
        )}
        {activeTab === "sessions" && <SessionsTab cohortId={cohortId} />}
        {activeTab === "assessments" && (
          <AssessmentsTab cohortId={cohortId} />
        )}
        {activeTab === "calendar" && <CalendarTab cohortId={cohortId} />}
      </div>
    </div>
  );
}

/* ─────────────────────── Overview Tab ─────────────────────── */

type CohortStats = {
  _id: Id<"cohorts">;
  name: string;
  description?: string;
  startDate?: number;
  endDate?: number;
  isActive: boolean;
  totalMembers: number;
  activeMembers: number;
  totalSessions: number;
  completedSessions: number;
  nextSessionTitle?: string;
  nextSessionDate?: number;
  pillarCounts: Record<string, number>;
};

function OverviewTab({
  cohortStats,
  cohortId,
  isEditing,
  setIsEditing,
  onSuccess,
}: {
  cohortStats: CohortStats;
  cohortId: Id<"cohorts">;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  onSuccess: (msg: string) => void;
}) {
  const updateCohort = useMutation(api.cohorts.update);
  const { error, clearError, handleError } = useMutationWithError();
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: cohortStats.name,
    description: cohortStats.description || "",
    startDate: cohortStats.startDate
      ? new Date(cohortStats.startDate).toISOString().split("T")[0]
      : "",
    endDate: cohortStats.endDate
      ? new Date(cohortStats.endDate).toISOString().split("T")[0]
      : "",
    isActive: cohortStats.isActive,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCohort({
        cohortId,
        name: editForm.name,
        description: editForm.description || undefined,
        startDate: editForm.startDate
          ? new Date(editForm.startDate).getTime()
          : undefined,
        endDate: editForm.endDate
          ? new Date(editForm.endDate).getTime()
          : undefined,
        isActive: editForm.isActive,
      });
      setIsEditing(false);
      onSuccess("Cohort updated successfully");
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  };

  const completionRate =
    cohortStats.totalSessions > 0
      ? Math.round(
          (cohortStats.completedSessions / cohortStats.totalSessions) * 100,
        )
      : 0;

  const pillarEntries = Object.entries(cohortStats.pillarCounts);
  const maxPillarCount = Math.max(...pillarEntries.map(([, c]) => c), 1);

  return (
    <div className="space-y-6">
      {error && <ErrorToast message={error} onClose={clearError} />}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-[#171717]">
            {cohortStats.name}
          </h2>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cohortStats.isActive ? "bg-[#E6FBF0] text-[#00D632]" : "bg-[#F0F0F0] text-[#737373]"}`}
          >
            {cohortStats.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <button
          onClick={() => {
            if (isEditing) {
              setIsEditing(false);
            } else {
              setEditForm({
                name: cohortStats.name,
                description: cohortStats.description || "",
                startDate: cohortStats.startDate
                  ? new Date(cohortStats.startDate).toISOString().split("T")[0]
                  : "",
                endDate: cohortStats.endDate
                  ? new Date(cohortStats.endDate).toISOString().split("T")[0]
                  : "",
                isActive: cohortStats.isActive,
              });
              setIsEditing(true);
            }
          }}
          className="self-start rounded-md border border-[#E5E5E5] bg-white px-4 py-2 text-sm font-medium text-[#262626] hover:bg-[#F7F7F7]"
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      {/* Edit form */}
      {isEditing && (
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-[#262626]">
                Name
              </label>
              <input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm outline-none focus:border-[#171717]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#262626]">
                Description
              </label>
              <input
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                className="h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm outline-none focus:border-[#171717]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#262626]">
                Start Date
              </label>
              <input
                type="date"
                value={editForm.startDate}
                onChange={(e) =>
                  setEditForm({ ...editForm, startDate: e.target.value })
                }
                className="h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm outline-none focus:border-[#171717]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#262626]">
                End Date
              </label>
              <input
                type="date"
                value={editForm.endDate}
                onChange={(e) =>
                  setEditForm({ ...editForm, endDate: e.target.value })
                }
                className="h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm outline-none focus:border-[#171717]"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-[#262626]">
              <button
                type="button"
                role="switch"
                aria-checked={editForm.isActive}
                onClick={() =>
                  setEditForm({ ...editForm, isActive: !editForm.isActive })
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${editForm.isActive ? "bg-[#00D632]" : "bg-[#E5E5E5]"}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform duration-200 ${editForm.isActive ? "translate-x-[22px]" : "translate-x-0.5"}`}
                />
              </button>
              Active
            </label>
            <button
              onClick={handleSave}
              disabled={saving || !editForm.name}
              className="rounded-md bg-[#00D632] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
          <p className="text-2xl font-semibold text-[#171717]">
            {cohortStats.totalMembers}
          </p>
          <p className="mt-1 text-xs text-[#737373]">Total Members</p>
          <p className="mt-0.5 text-[11px] text-[#00D632]">
            {cohortStats.activeMembers} active
          </p>
        </div>
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
          <p className="text-2xl font-semibold text-[#171717]">
            {cohortStats.completedSessions}/{cohortStats.totalSessions}
          </p>
          <p className="mt-1 text-xs text-[#737373]">Sessions</p>
          <p className="mt-0.5 text-[11px] text-[#737373]">completed / total</p>
        </div>
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
          {cohortStats.nextSessionTitle ? (
            <>
              <p className="text-sm font-semibold text-[#171717] truncate">
                {cohortStats.nextSessionTitle}
              </p>
              <p className="mt-1 text-xs text-[#737373]">Next Session</p>
              <p className="mt-0.5 text-[11px] text-[#262626]">
                {cohortStats.nextSessionDate
                  ? new Date(cohortStats.nextSessionDate).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "short", year: "numeric" },
                    )
                  : ""}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-[#737373]">
                None scheduled
              </p>
              <p className="mt-1 text-xs text-[#737373]">Next Session</p>
            </>
          )}
        </div>
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
          <p className="text-2xl font-semibold text-[#171717]">
            {completionRate}%
          </p>
          <p className="mt-1 text-xs text-[#737373]">Completion Rate</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-[#F0F0F0]">
            <div
              className="h-1.5 rounded-full bg-[#00D632] transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pillar Distribution */}
      {pillarEntries.length > 0 && (
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
          <h3 className="text-sm font-semibold text-[#171717] mb-4">
            Pillar Distribution
          </h3>
          <div className="flex items-end justify-around gap-4 pt-2">
            {pillarEntries.map(([pillar, count]) => {
              const config = PILLAR_CONFIG[pillar] || {
                label: pillar,
                color: "#737373",
              };
              const percentage = Math.round((count / maxPillarCount) * 100);
              return (
                <div
                  key={pillar}
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  <span className="text-xs font-semibold text-[#262626]">
                    {count}
                  </span>
                  <div
                    className="w-full max-w-[48px] rounded-t-md bg-[#F0F0F0]"
                    style={{ height: 140 }}
                  >
                    <div
                      className="w-full rounded-t-md transition-all"
                      style={{
                        height: `${percentage}%`,
                        backgroundColor: config.color,
                        marginTop: `${100 - percentage}%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-[#737373] text-center leading-tight">
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pillarEntries.length === 0 && (
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
          <h3 className="text-sm font-semibold text-[#171717] mb-2">
            Pillar Distribution
          </h3>
          <p className="text-xs text-[#737373]">
            No sessions have been added to this cohort yet.
          </p>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Members Tab ─────────────────────── */

function MembersTab({
  cohortId,
  onSuccess,
}: {
  cohortId: Id<"cohorts">;
  onSuccess: (msg: string) => void;
}) {
  const members = useQuery(api.cohorts.listMembers, { cohortId });
  const addMember = useMutation(api.cohorts.addMember);
  const updateMemberStatus = useMutation(api.cohorts.updateMemberStatus);
  const { error, clearError, handleError } = useMutationWithError();

  const [searchFilter, setSearchFilter] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "joinedAt">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Add member form state
  const [beneficiarySearch, setBeneficiarySearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(
    null,
  );
  const [addStatus, setAddStatus] = useState<
    (typeof MEMBER_STATUSES)[number]
  >("active");
  const [addingSaving, setAddingSaving] = useState(false);

  const debouncedSearch = useDebounce(beneficiarySearch, 350);
  const searchResults = useQuery(
    api.users.searchBeneficiaries,
    showAddForm && debouncedSearch.length > 1
      ? { search: debouncedSearch }
      : "skip",
  );

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    let result = members.filter((m) => {
      if (!searchFilter) return true;
      const term = searchFilter.toLowerCase();
      return (
        m.user?.name?.toLowerCase().includes(term) ||
        m.user?.email?.toLowerCase().includes(term)
      );
    });

    result.sort((a, b) => {
      if (sortBy === "name") {
        const nameA = a.user?.name || "";
        const nameB = b.user?.name || "";
        return sortDir === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      } else {
        return sortDir === "asc"
          ? a.joinedAt - b.joinedAt
          : b.joinedAt - a.joinedAt;
      }
    });

    return result;
  }, [members, searchFilter, sortBy, sortDir]);

  const statusCounts = useMemo(() => {
    if (!members) return {};
    const counts: Record<string, number> = {};
    for (const m of members) {
      counts[m.status] = (counts[m.status] || 0) + 1;
    }
    return counts;
  }, [members]);

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    setAddingSaving(true);
    try {
      await addMember({ cohortId, userId: selectedUserId, status: addStatus });
      setShowAddForm(false);
      setBeneficiarySearch("");
      setSelectedUserId(null);
      setAddStatus("active");
      onSuccess("Member added successfully");
    } catch (err) {
      handleError(err);
    } finally {
      setAddingSaving(false);
    }
  };

  const handleStatusChange = async (
    membershipId: Id<"cohortMemberships">,
    newStatus: (typeof MEMBER_STATUSES)[number],
  ) => {
    try {
      await updateMemberStatus({ membershipId, status: newStatus });
      onSuccess("Member status updated");
    } catch (err) {
      handleError(err);
    }
  };

  const toggleSort = (field: "name" | "joinedAt") => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  if (members === undefined) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <ErrorToast message={error} onClose={clearError} />}

      {/* Summary */}
      <div className="text-sm text-[#737373]">
        {members.length} member{members.length !== 1 ? "s" : ""}
        {Object.entries(statusCounts).length > 0 && (
          <span>
            {" "}
            (
            {Object.entries(statusCounts)
              .map(([status, count]) => `${count} ${status}`)
              .join(", ")}
            )
          </span>
        )}
      </div>

      {/* Search + Add */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="#737373"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="absolute left-3 top-1/2 -translate-y-1/2"
          >
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5L14 14" />
          </svg>
          <input
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search members by name or email..."
            className="h-10 w-full rounded-lg border border-[#E5E5E5] pl-9 pr-3 text-sm outline-none focus:border-[#171717]"
          />
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="shrink-0 rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white hover:bg-[#262626]"
        >
          {showAddForm ? "Cancel" : "+ Add Member"}
        </button>
      </div>

      {/* Add member form */}
      {showAddForm && (
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
          <h3 className="text-sm font-semibold text-[#171717] mb-3">
            Add Member
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-[#262626]">
                Search Beneficiary
              </label>
              <input
                value={beneficiarySearch}
                onChange={(e) => {
                  setBeneficiarySearch(e.target.value);
                  setSelectedUserId(null);
                }}
                placeholder="Type a name or email..."
                className="h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm outline-none focus:border-[#171717]"
              />
              {searchResults && searchResults.length > 0 && !selectedUserId && (
                <div className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-[#E5E5E5] bg-white shadow-md">
                  {searchResults.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => {
                        setSelectedUserId(user._id);
                        setBeneficiarySearch(user.name || user.email);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#F7F7F7]"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E6FBF0] text-[10px] font-semibold text-[#00D632]">
                        {(user.name || "?")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#171717]">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-[#737373]">
                          {user.email}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {searchResults &&
                searchResults.length === 0 &&
                beneficiarySearch.length > 0 && (
                  <p className="mt-1 text-xs text-[#737373]">
                    No beneficiaries found.
                  </p>
                )}
              {selectedUserId && (
                <p className="mt-1 text-xs text-[#00D632]">
                  Beneficiary selected
                </p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#262626]">
                Initial Status
              </label>
              <Select
                value={addStatus}
                onChange={(val) =>
                  setAddStatus(val as (typeof MEMBER_STATUSES)[number])
                }
                options={MEMBER_STATUSES.map((s) => ({
                  label: s.charAt(0).toUpperCase() + s.slice(1),
                  value: s,
                }))}
                placeholder="Select status"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAddMember}
              disabled={addingSaving || !selectedUserId}
              className="rounded-md bg-[#00D632] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {addingSaving ? "Adding..." : "Add to Cohort"}
            </button>
          </div>
        </div>
      )}

      {/* Members table */}
      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white py-16">
          <h3 className="text-base font-semibold text-[#171717]">
            No members yet
          </h3>
          <p className="mt-1 text-sm text-[#737373]">
            Add beneficiaries to this cohort.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#E5E5E5] bg-white overflow-hidden">
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-[#F7F7F7]">
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-[#737373] cursor-pointer hover:text-[#171717]"
                    onClick={() => toggleSort("name")}
                  >
                    Name{" "}
                    {sortBy === "name" && (sortDir === "asc" ? "^" : "v")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#737373]">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#737373]">
                    Status
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-[#737373] cursor-pointer hover:text-[#171717]"
                    onClick={() => toggleSort("joinedAt")}
                  >
                    Joined{" "}
                    {sortBy === "joinedAt" && (sortDir === "asc" ? "^" : "v")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#737373]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((m) => {
                  const sc = STATUS_COLORS[m.status] || STATUS_COLORS.alumni;
                  return (
                    <tr
                      key={m._id}
                      className="border-b border-[#F0F0F0] last:border-0 hover:bg-[#F7F7F7]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E6FBF0] text-[10px] font-semibold text-[#00D632]">
                            {(m.user?.name || "?")[0].toUpperCase()}
                          </div>
                          <span className="font-medium text-[#171717]">
                            {m.user?.name || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#737373]">
                        {m.user?.email || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${sc.bg} ${sc.text}`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#737373]">
                        {new Date(m.joinedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={m.status}
                          onChange={(val) =>
                            handleStatusChange(
                              m._id,
                              val as (typeof MEMBER_STATUSES)[number],
                            )
                          }
                          options={MEMBER_STATUSES.map((s) => ({
                            label: s.charAt(0).toUpperCase() + s.slice(1),
                            value: s,
                          }))}
                          variant="compact"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="sm:hidden divide-y divide-[#F0F0F0]">
            {filteredMembers.map((m) => {
              const sc = STATUS_COLORS[m.status] || STATUS_COLORS.alumni;
              return (
                <div key={m._id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E6FBF0] text-xs font-semibold text-[#00D632]">
                        {(m.user?.name || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#171717]">
                          {m.user?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-[#737373]">
                          {m.user?.email || "-"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${sc.bg} ${sc.text}`}
                    >
                      {m.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-[#737373]">
                      Joined{" "}
                      {new Date(m.joinedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <Select
                      value={m.status}
                      onChange={(val) =>
                        handleStatusChange(
                          m._id,
                          val as (typeof MEMBER_STATUSES)[number],
                        )
                      }
                      options={MEMBER_STATUSES.map((s) => ({
                        label: s.charAt(0).toUpperCase() + s.slice(1),
                        value: s,
                      }))}
                      variant="compact"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMembers.length === 0 && members.length > 0 && (
            <div className="py-8 text-center text-sm text-[#737373]">
              No members match your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

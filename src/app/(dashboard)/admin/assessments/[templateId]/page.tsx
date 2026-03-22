"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { use, useState } from "react";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-yellow-50 text-yellow-600",
  published: "bg-[#E6FBF0] text-[#00D632]",
  archived: "bg-[#F0F0F0] text-[#737373]",
};

const ASSIGNMENT_STATUS_COLORS: Record<string, string> = {
  assigned: "bg-blue-50 text-blue-600",
  in_progress: "bg-yellow-50 text-yellow-600",
  completed: "bg-[#E6FBF0] text-[#00D632]",
  overdue: "bg-red-50 text-red-600",
};

const SEVERITY_BADGE_COLORS: Record<string, string> = {
  "Minimal": "bg-[#E6FBF0] text-[#00D632]",
  "Minimal anxiety": "bg-[#E6FBF0] text-[#00D632]",
  "High": "bg-[#E6FBF0] text-[#00D632]",
  "High resilience": "bg-[#E6FBF0] text-[#00D632]",
  "Normal": "bg-[#E6FBF0] text-[#00D632]",
  "Mild": "bg-yellow-50 text-yellow-600",
  "Mild anxiety": "bg-yellow-50 text-yellow-600",
  "Moderate": "bg-yellow-50 text-yellow-600",
  "Average": "bg-yellow-50 text-yellow-600",
  "Below Average": "bg-yellow-50 text-yellow-600",
  "Moderately severe": "bg-orange-50 text-orange-600",
  "Low": "bg-orange-50 text-orange-600",
  "Severe": "bg-red-50 text-red-600",
  "Very Low": "bg-red-50 text-red-600",
};

const FLAG_BADGE_STYLES: Record<string, string> = {
  mentor_notify: "bg-yellow-50 text-yellow-600",
  admin_review: "bg-red-50 text-red-600",
  none: "bg-[#F0F0F0] text-[#737373]",
};

type Tab = "details" | "assignments";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminTemplateDetailPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = use(params);
  const id = templateId as Id<"assessmentTemplates">;
  const template = useQuery(api.assessments.templates.getById, {
    templateId: id,
  });
  const assignments = useQuery(
    api.assessments.scoring.getAssignmentsByTemplate,
    { templateId: id },
  );
  const publishTemplate = useMutation(api.assessments.templates.publish);
  const archiveTemplate = useMutation(api.assessments.templates.archive);
  const updateDraft = useMutation(api.assessments.templates.updateDraft);

  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [itemText, setItemText] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("details");

  if (template === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="p-6 lg:p-10">
        <Link href="/admin/assessments" className="text-sm text-[#737373]">
          &larr; Back
        </Link>
        <p className="mt-8 text-center">Template not found.</p>
      </div>
    );
  }

  const isDraft = template.status === "draft";
  const isArchived = template.status === "archived";

  const handlePublish = async () => {
    setSaving(true);
    try {
      await publishTemplate({ templateId: id });
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    setSaving(true);
    try {
      await archiveTemplate({ templateId: id });
    } finally {
      setSaving(false);
    }
  };

  const handleItemUpdate = async (itemNumber: number) => {
    if (!isDraft) return;
    setSaving(true);
    try {
      const updatedItems = template.items.map((item) =>
        item.itemNumber === itemNumber ? { ...item, text: itemText } : item,
      );
      await updateDraft({ templateId: id, items: updatedItems });
      setEditingItem(null);
      setItemText("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <Link
        href="/admin/assessments"
        className="text-sm text-[#737373] hover:text-[#171717]"
      >
        &larr; Back to assessments
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-[#171717]">
              {template.name}
            </h1>
            <span className="rounded bg-[#F0F0F0] px-2 py-0.5 text-[10px] font-bold text-[#525252]">
              {template.shortCode}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[template.status]}`}
            >
              {template.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#737373]">
            Version {template.version} · {template.items.length} items
            {template.pillar
              ? ` · ${template.pillar.replace(/_/g, " ")}`
              : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {isDraft && (
            <button
              onClick={handlePublish}
              disabled={saving || template.items.length === 0}
              className="rounded-md bg-[#00D632] px-4 py-2 text-sm font-medium text-white hover:bg-[#00C02D] disabled:opacity-50"
            >
              Publish
            </button>
          )}
          {!isArchived && (
            <button
              onClick={handleArchive}
              disabled={saving}
              className="rounded-md bg-[#F0F0F0] px-4 py-2 text-sm font-medium text-[#525252] hover:bg-[#E5E5E5] disabled:opacity-50"
            >
              Archive
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex border-b border-[#E5E5E5]">
        <button
          onClick={() => setActiveTab("details")}
          className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "details"
              ? "text-[#171717]"
              : "text-[#737373] hover:text-[#525252]"
          }`}
        >
          Template Details
          {activeTab === "details" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00D632]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("assignments")}
          className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "assignments"
              ? "text-[#171717]"
              : "text-[#737373] hover:text-[#525252]"
          }`}
        >
          Assignments
          {assignments && (
            <span className="ml-1.5 rounded-full bg-[#F0F0F0] px-1.5 py-0.5 text-[10px] text-[#737373]">
              {assignments.length}
            </span>
          )}
          {activeTab === "assignments" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00D632]" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "details" && (
          <TemplateDetailsTab
            template={template}
            isDraft={isDraft}
            editingItem={editingItem}
            setEditingItem={setEditingItem}
            itemText={itemText}
            setItemText={setItemText}
            saving={saving}
            handleItemUpdate={handleItemUpdate}
          />
        )}

        {activeTab === "assignments" && (
          <AssignmentsTab assignments={assignments} />
        )}
      </div>
    </div>
  );
}

// ─── Template Details Tab ───

function TemplateDetailsTab({
  template,
  isDraft,
  editingItem,
  setEditingItem,
  itemText,
  setItemText,
  saving,
  handleItemUpdate,
}: {
  template: {
    description?: string;
    sourceCitation?: string;
    licenseNotes?: string;
    adaptationNotes?: string;
    pillar?: string;
    sessionNumber?: number;
    totalScoreRange?: { min: number; max: number };
    scoringMethod?: string;
    subscales?: { name: string; itemNumbers: number[] }[];
    severityBands?: {
      label: string;
      min: number;
      max: number;
      flagBehavior?: string;
    }[];
    items: {
      itemNumber: number;
      text: string;
      isReversed: boolean;
      subscale?: string;
      responseOptions: { label: string; value: number }[];
    }[];
  };
  isDraft: boolean;
  editingItem: number | null;
  setEditingItem: (n: number | null) => void;
  itemText: string;
  setItemText: (s: string) => void;
  saving: boolean;
  handleItemUpdate: (n: number) => void;
}) {
  return (
    <>
      {/* Metadata */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">
            Metadata
          </h2>
          <div className="mt-4 space-y-3">
            <DetailRow label="Description" value={template.description} />
            <DetailRow
              label="Source Citation"
              value={template.sourceCitation}
            />
            <DetailRow label="License Notes" value={template.licenseNotes} />
            <DetailRow
              label="Adaptation Notes"
              value={template.adaptationNotes}
            />
            <DetailRow
              label="Pillar"
              value={template.pillar?.replace(/_/g, " ")}
            />
            <DetailRow
              label="Session"
              value={template.sessionNumber?.toString()}
            />
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">
            Scoring
          </h2>
          <div className="mt-4 space-y-3">
            <DetailRow
              label="Method"
              value={template.scoringMethod || "sum"}
            />
            {template.totalScoreRange && (
              <DetailRow
                label="Score Range"
                value={`${template.totalScoreRange.min} \u2013 ${template.totalScoreRange.max}`}
              />
            )}
            {template.subscales && template.subscales.length > 0 && (
              <div>
                <p className="text-sm text-[#737373]">Subscales</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {template.subscales.map((s) => (
                    <span
                      key={s.name}
                      className="rounded-full bg-[#F0F0F0] px-2 py-0.5 text-[10px] text-[#525252]"
                    >
                      {s.name} ({s.itemNumbers.length} items)
                    </span>
                  ))}
                </div>
              </div>
            )}
            {template.severityBands && template.severityBands.length > 0 && (
              <div>
                <p className="text-sm text-[#737373]">Severity Bands</p>
                <div className="mt-1 space-y-1">
                  {template.severityBands.map((b) => (
                    <div
                      key={b.label}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-[#171717]">{b.label}</span>
                      <span className="text-[#737373]">
                        {b.min}\u2013{b.max}{" "}
                        {b.flagBehavior && b.flagBehavior !== "none"
                          ? `(${b.flagBehavior.replace("_", " ")})`
                          : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="mt-6 rounded-xl border border-[#E5E5E5] bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">
          Items ({template.items.length})
        </h2>
        {template.items.length === 0 ? (
          <p className="mt-4 text-sm text-[#737373]">
            No items yet. {isDraft ? "Add items to this template." : ""}
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {template.items.map((item) => (
              <div
                key={item.itemNumber}
                className="rounded-lg border border-[#F0F0F0] px-3 py-2"
              >
                {editingItem === item.itemNumber ? (
                  <div className="flex gap-2">
                    <input
                      value={itemText}
                      onChange={(e) => setItemText(e.target.value)}
                      className="flex-1 rounded border border-[#E5E5E5] px-2 py-1 text-sm outline-none focus:border-[#171717]"
                    />
                    <button
                      onClick={() => handleItemUpdate(item.itemNumber)}
                      disabled={saving}
                      className="rounded bg-[#171717] px-3 py-1 text-xs text-white"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingItem(null)}
                      className="rounded px-3 py-1 text-xs text-[#737373]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#737373]">
                        Q{item.itemNumber}
                      </span>
                      <span className="text-sm text-[#171717]">
                        {item.text}
                      </span>
                      {item.isReversed && (
                        <span className="rounded bg-yellow-50 px-1.5 py-0.5 text-[9px] text-yellow-600">
                          R
                        </span>
                      )}
                      {item.subscale && (
                        <span className="rounded bg-[#F0F0F0] px-1.5 py-0.5 text-[9px] text-[#737373]">
                          {item.subscale}
                        </span>
                      )}
                    </div>
                    {isDraft && (
                      <button
                        onClick={() => {
                          setEditingItem(item.itemNumber);
                          setItemText(item.text);
                        }}
                        className="text-xs text-[#737373] hover:text-[#171717]"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Assignments Tab ───

interface AssignmentRecord {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: string;
  createdAt: number;
  dueDate?: number;
  score: {
    _id: string;
    totalScore?: number;
    subscaleScores?: Record<string, number>;
    severityBand?: string;
    flagBehavior?: string;
    scoredAt: number;
  } | null;
}

function AssignmentsTab({
  assignments,
}: {
  assignments: AssignmentRecord[] | undefined;
}) {
  if (assignments === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white py-16">
        <h2 className="text-base font-semibold text-[#171717]">
          No assignments
        </h2>
        <p className="mt-1 text-sm text-[#737373]">
          No beneficiaries have been assigned this template yet.
        </p>
      </div>
    );
  }

  const completed = assignments.filter((a) => a.status === "completed");
  const pending = assignments.filter((a) => a.status !== "completed");

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex gap-4">
        <div className="rounded-lg border border-[#E5E5E5] bg-white px-4 py-3">
          <p className="text-xs text-[#737373]">Total Assigned</p>
          <p className="text-lg font-semibold text-[#171717]">
            {assignments.length}
          </p>
        </div>
        <div className="rounded-lg border border-[#E5E5E5] bg-white px-4 py-3">
          <p className="text-xs text-[#737373]">Completed</p>
          <p className="text-lg font-semibold text-[#00D632]">
            {completed.length}
          </p>
        </div>
        <div className="rounded-lg border border-[#E5E5E5] bg-white px-4 py-3">
          <p className="text-xs text-[#737373]">Pending</p>
          <p className="text-lg font-semibold text-[#F59E0B]">
            {pending.length}
          </p>
        </div>
      </div>

      {/* Assignments table */}
      <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F0F0F0] text-left text-xs font-medium uppercase tracking-wider text-[#737373]">
                <th className="px-4 py-3">Beneficiary</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Flag</th>
                <th className="px-4 py-3">Assigned</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr
                  key={a._id}
                  className="border-b border-[#F0F0F0] last:border-0"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-[#171717]">
                      {a.userName}
                    </p>
                    <p className="text-xs text-[#737373]">{a.userEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ASSIGNMENT_STATUS_COLORS[a.status] ||
                        "bg-[#F0F0F0] text-[#737373]"
                      }`}
                    >
                      {a.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#171717]">
                    {a.score
                      ? a.score.totalScore !== undefined
                        ? typeof a.score.totalScore === "number" &&
                          a.score.totalScore % 1 !== 0
                          ? a.score.totalScore.toFixed(2)
                          : a.score.totalScore
                        : a.score.subscaleScores
                          ? Object.entries(a.score.subscaleScores)
                              .map(
                                ([k, v]) =>
                                  `${k}: ${typeof v === "number" && v % 1 !== 0 ? v.toFixed(1) : v}`,
                              )
                              .join(", ")
                          : "\u2014"
                      : "\u2014"}
                  </td>
                  <td className="px-4 py-3">
                    {a.score?.severityBand ? (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          SEVERITY_BADGE_COLORS[a.score.severityBand] ||
                          "bg-[#F0F0F0] text-[#737373]"
                        }`}
                      >
                        {a.score.severityBand}
                      </span>
                    ) : (
                      <span className="text-xs text-[#D4D4D4]">\u2014</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {a.score?.flagBehavior &&
                    a.score.flagBehavior !== "none" ? (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          FLAG_BADGE_STYLES[a.score.flagBehavior] ||
                          "bg-[#F0F0F0] text-[#737373]"
                        }`}
                      >
                        {a.score.flagBehavior.replace("_", " ")}
                      </span>
                    ) : (
                      <span className="text-xs text-[#D4D4D4]">\u2014</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#737373]">
                    {formatDate(a.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {a.score ? (
                      <Link
                        href={`/admin/assessments/results/${a.score._id}`}
                        className="text-xs font-medium text-[#00D632] hover:underline"
                      >
                        View Results
                      </Link>
                    ) : (
                      <span className="text-xs text-[#D4D4D4]">
                        Not completed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Shared Components ───

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start justify-between border-b border-[#F0F0F0] pb-2 last:border-0">
      <span className="text-sm text-[#737373]">{label}</span>
      <span className="text-right text-sm text-[#171717]">
        {value || <span className="text-[#D4D4D4]">&mdash;</span>}
      </span>
    </div>
  );
}

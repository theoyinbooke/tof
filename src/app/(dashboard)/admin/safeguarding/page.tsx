"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState } from "react";

type Status = "open" | "in_progress" | "resolved" | "dismissed";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-red-50 text-red-600",
  in_progress: "bg-yellow-50 text-yellow-600",
  resolved: "bg-[#E6FBF0] text-[#00D632]",
  dismissed: "bg-[#F0F0F0] text-[#737373]",
};

export default function AdminSafeguardingPage() {
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const actions = useQuery(api.safeguarding.listAll, {
    status: statusFilter === "all" ? undefined : statusFilter,
  });
  const updateAction = useMutation(api.safeguarding.updateAction);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  if (actions === undefined) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" /></div>;
  }

  const handleStatusChange = async (actionId: typeof actions[0]["_id"], newStatus: Status) => {
    setSaving(true);
    try {
      await updateAction({
        actionId,
        status: newStatus,
        resolutionNote: note || undefined,
      });
      setNote("");
      setExpandedId(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-xl font-semibold text-[#171717]">Safeguarding</h1>
      <p className="mt-1 text-sm text-[#737373]">Flagged assessment scores requiring action.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["all", "open", "in_progress", "resolved", "dismissed"] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === s ? "bg-[#171717] text-white" : "bg-[#F0F0F0] text-[#525252] hover:bg-[#E5E5E5]"}`}>
            {s === "all" ? "All" : s.replace("_", " ")}
          </button>
        ))}
      </div>

      {actions.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white py-16">
          <h2 className="text-base font-semibold text-[#171717]">No actions</h2>
          <p className="mt-1 text-sm text-[#737373]">No safeguarding actions match this filter.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {actions.map((a) => (
            <div key={a._id} className="rounded-xl border border-[#E5E5E5] bg-white p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${a.flagBehavior === "admin_review" ? "bg-red-50" : "bg-yellow-50"}`}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={a.flagBehavior === "admin_review" ? "#EF4444" : "#F59E0B"} strokeWidth="1.5" strokeLinecap="round">
                      <path d="M7 1v5M7 9v1" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#171717] truncate">{a.user?.name || "Unknown"}</p>
                    <p className="text-xs text-[#737373] truncate">
                      {a.template?.shortCode || "?"} — Score: {a.score?.totalScore}
                      {a.score?.severityBand ? ` (${a.score.severityBand})` : ""}
                      {a.assignee ? ` · Assigned to ${a.assignee.name}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[a.status]}`}>
                    {a.status.replace("_", " ")}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${a.flagBehavior === "admin_review" ? "bg-red-50 text-red-600" : "bg-yellow-50 text-yellow-600"}`}>
                    {a.flagBehavior.replace("_", " ")}
                  </span>
                  <button onClick={() => setExpandedId(expandedId === a._id ? null : a._id)}
                    className="text-xs text-[#737373] hover:text-[#171717]">
                    {expandedId === a._id ? "Close" : "Manage"}
                  </button>
                </div>
              </div>

              {a.recommendedAction && (
                <p className="mt-2 text-xs text-[#525252]">Recommended: {a.recommendedAction}</p>
              )}
              {a.resolutionNote && (
                <p className="mt-1 text-xs text-[#737373]">Resolution: {a.resolutionNote}</p>
              )}

              {expandedId === a._id && (
                <div className="mt-4 border-t border-[#F0F0F0] pt-4">
                  <div className="mb-3">
                    <label className="mb-1 block text-xs text-[#737373]">Note</label>
                    <input value={note} onChange={(e) => setNote(e.target.value)}
                      placeholder="Resolution or action note"
                      className="h-9 w-full rounded-lg border border-[#E5E5E5] px-3 text-xs outline-none focus:border-[#171717]" />
                  </div>
                  <div className="flex gap-2">
                    {a.status === "open" && (
                      <button onClick={() => handleStatusChange(a._id, "in_progress")} disabled={saving}
                        className="rounded-md bg-yellow-500 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">
                        Start
                      </button>
                    )}
                    {(a.status === "open" || a.status === "in_progress") && (
                      <>
                        <button onClick={() => handleStatusChange(a._id, "resolved")} disabled={saving}
                          className="rounded-md bg-[#00D632] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">
                          Resolve
                        </button>
                        <button onClick={() => handleStatusChange(a._id, "dismissed")} disabled={saving}
                          className="rounded-md bg-[#F0F0F0] px-3 py-1.5 text-xs font-medium text-[#525252] disabled:opacity-50">
                          Dismiss
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

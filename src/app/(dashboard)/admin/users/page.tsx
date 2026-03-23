"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState } from "react";
import { Select } from "@/components/ui/select";

type Role = "admin" | "facilitator" | "mentor" | "beneficiary";

const ROLE_OPTIONS = [
  { label: "Admin", value: "admin" },
  { label: "Facilitator", value: "facilitator" },
  { label: "Mentor", value: "mentor" },
  { label: "Beneficiary", value: "beneficiary" },
];

function normalizeValue(value?: string) {
  return value?.trim().toLowerCase() || "";
}

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState<Role | undefined>();
  const users = useQuery(api.users.listUsers, { role: roleFilter });
  const updateRole = useMutation(api.users.updateUserRole);
  const toggleActive = useMutation(api.users.toggleUserActive);
  const auditLogs = useQuery(api.auditLogs.list, { limit: 20 });
  const [saving, setSaving] = useState<string | null>(null);

  if (users === undefined) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" /></div>;
  }

  const handleRoleChange = async (userId: typeof users[0]["_id"], newRole: Role) => {
    setSaving(userId);
    try { await updateRole({ userId, role: newRole }); } finally { setSaving(null); }
  };

  const handleToggleActive = async (userId: typeof users[0]["_id"], isActive: boolean) => {
    setSaving(userId);
    try { await toggleActive({ userId, isActive }); } finally { setSaving(null); }
  };

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-xl font-semibold text-[#171717]">User Management</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {[undefined, "admin", "facilitator", "mentor", "beneficiary"].map((r) => (
          <button key={r || "all"} onClick={() => setRoleFilter(r as Role | undefined)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${roleFilter === r ? "bg-[#171717] text-white" : "bg-[#F0F0F0] text-[#525252] hover:bg-[#E5E5E5]"}`}>
            {r ? r[0].toUpperCase() + r.slice(1) : "All"}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
        {users.length === 0 ? (
          <p className="p-6 text-sm text-[#737373]">No users found.</p>
        ) : (
          users.map((u, i) => {
            const displayName = u.displayName?.trim() || u.name?.trim() || "";
            const hasDistinctName =
              normalizeValue(displayName) !== "" &&
              normalizeValue(displayName) !== normalizeValue(u.email);
            const title = hasDistinctName ? displayName : "No name provided";
            const avatarSeed = hasDistinctName ? displayName : u.email;

            return (
              <div key={u._id} className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 ${i > 0 ? "border-t border-[#F0F0F0]" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F0F0] text-xs font-medium text-[#525252]">
                    {(avatarSeed[0] || "?").toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#171717]">{title}</p>
                    <p className="text-xs text-[#737373]">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={u.role}
                    onChange={(val) => handleRoleChange(u._id, val as Role)}
                    options={ROLE_OPTIONS}
                    disabled={saving === u._id}
                    variant="compact"
                  />
                  <button onClick={() => handleToggleActive(u._id, !u.isActive)} disabled={saving === u._id}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${u.isActive ? "bg-[#E6FBF0] text-[#00D632]" : "bg-red-50 text-red-600"}`}>
                    {u.isActive ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Recent audit logs */}
      {auditLogs && auditLogs.length > 0 && (
        <div className="mt-8 rounded-xl border border-[#E5E5E5] bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">Recent Audit Log</h2>
          <div className="mt-4 space-y-2">
            {auditLogs.map((l) => (
              <div key={l._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-[#F0F0F0] pb-2 last:border-0">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#171717] truncate">{l.action}</p>
                  <p className="text-[10px] text-[#737373] truncate">{l.userName} · {l.resource} {l.details ? `· ${l.details}` : ""}</p>
                </div>
                <p className="text-[10px] text-[#D4D4D4] shrink-0">{new Date(l.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

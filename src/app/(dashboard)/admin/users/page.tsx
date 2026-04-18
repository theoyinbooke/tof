"use client";

import { useQuery, useMutation, useAction } from "convex/react";
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
  const createUser = useAction(api.users.adminCreateUser);
  const auditLogs = useQuery(api.auditLogs.list, { limit: 20 });
  const [saving, setSaving] = useState<string | null>(null);

  // Create user dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", email: "", role: "beneficiary" as Role });
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);
    try {
      await createUser({ name: createForm.name, email: createForm.email, role: createForm.role });
      setCreateSuccess(true);
      setCreateForm({ name: "", email: "", role: "beneficiary" });
      setTimeout(() => { setShowCreateDialog(false); setCreateSuccess(false); }, 2000);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#171717]">User Management</h1>
        <button
          onClick={() => { setShowCreateDialog(true); setCreateError(null); setCreateSuccess(false); }}
          className="rounded-lg bg-[#00D632] px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          + Create User
        </button>
      </div>

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

      {/* Create User Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-[#171717]">Create User</h2>
              <button onClick={() => setShowCreateDialog(false)} className="text-[#737373] hover:text-[#171717] text-xl leading-none">&times;</button>
            </div>

            {createSuccess ? (
              <div className="rounded-lg bg-[#E6FBF0] p-4 text-sm text-[#00A827] text-center font-medium">
                User created! Invitation email sent.
              </div>
            ) : (
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#525252] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Jane Doe"
                    className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm text-[#171717] outline-none focus:border-[#00D632] focus:ring-1 focus:ring-[#00D632]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#525252] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="jane@example.com"
                    className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm text-[#171717] outline-none focus:border-[#00D632] focus:ring-1 focus:ring-[#00D632]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#525252] mb-1">Role</label>
                  <Select
                    value={createForm.role}
                    onChange={(val) => setCreateForm((f) => ({ ...f, role: val as Role }))}
                    options={ROLE_OPTIONS}
                  />
                </div>

                {createError && (
                  <p className="rounded-lg bg-red-50 p-3 text-xs text-red-600">{createError}</p>
                )}

                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setShowCreateDialog(false)}
                    className="flex-1 rounded-lg border border-[#E5E5E5] py-2 text-sm font-medium text-[#525252] hover:bg-[#F0F0F0]">
                    Cancel
                  </button>
                  <button type="submit" disabled={creating}
                    className="flex-1 rounded-lg bg-[#00D632] py-2 text-sm font-medium text-black hover:opacity-90 disabled:opacity-50">
                    {creating ? "Creating…" : "Create & Invite"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useDeferredValue } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  facilitator: "Facilitator",
  mentor: "Mentor",
  beneficiary: "Beneficiary",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-[#171717] text-white",
  facilitator: "bg-[#3B82F6] text-white",
  mentor: "bg-[#8B5CF6] text-white",
  beneficiary: "bg-[#00D632] text-white",
};

export function ContactPicker({
  onSelect,
  onClose,
}: {
  onSelect: (userId: Id<"users">) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const contacts = useQuery(api.messaging.getAccessibleContacts);

  const filtered =
    contacts?.filter(
      (c) =>
        c.name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(deferredSearch.toLowerCase()),
    ) ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 mx-4 w-full max-w-md rounded-xl border border-[#E5E5E5] bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E5E5] px-4 py-3">
          <h2 className="text-sm font-semibold text-[#171717]">New Message</h2>
          <button
            onClick={onClose}
            className="text-[#737373] hover:text-[#171717]"
            aria-label="Close"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="h-9 w-full rounded-lg border border-[#E5E5E5] bg-[#F7F7F7] px-3 text-sm text-[#171717] outline-none placeholder:text-[#A3A3A3] focus:border-[#171717]"
            autoFocus
          />
        </div>

        {/* Contact list */}
        <div className="max-h-[50vh] overflow-y-auto px-2 pb-2">
          {contacts === undefined ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-6 text-center text-xs text-[#737373]">
              {search ? "No contacts match your search" : "No contacts available"}
            </p>
          ) : (
            filtered.map((contact) => (
              <button
                key={contact._id}
                onClick={() => onSelect(contact._id as Id<"users">)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-[#F0F0F0] transition-colors"
              >
                {/* Avatar */}
                {contact.avatarUrl ? (
                  <img
                    src={contact.avatarUrl}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E5E5E5]">
                    <span className="text-xs font-medium text-[#737373]">
                      {contact.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium text-[#171717]">
                    {contact.name}
                  </p>
                  <p className="truncate text-xs text-[#737373]">{contact.email}</p>
                </div>

                {/* Role badge */}
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ROLE_COLORS[contact.role] ?? "bg-[#E5E5E5] text-[#737373]"}`}
                >
                  {ROLE_LABELS[contact.role] ?? contact.role}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

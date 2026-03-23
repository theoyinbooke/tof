"use client";

import { useState, useDeferredValue } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(timestamp).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

type ConversationItem = {
  _id: Id<"conversations">;
  lastMessagePreview?: string;
  lastMessageAt?: number;
  unreadCount: number;
  otherUser: {
    _id: Id<"users">;
    name: string;
    email: string;
    avatarUrl?: string;
    role: string;
  } | null;
};

export function ConversationList({
  activeConversationId,
  onSelectConversation,
  onNewMessage,
}: {
  activeConversationId: Id<"conversations"> | null;
  onSelectConversation: (id: Id<"conversations">) => void;
  onNewMessage: () => void;
}) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const conversations = useQuery(api.messaging.listConversations);

  const filtered =
    conversations?.filter((c: ConversationItem) => {
      if (!deferredSearch) return true;
      const q = deferredSearch.toLowerCase();
      return (
        c.otherUser?.name.toLowerCase().includes(q) ||
        c.otherUser?.email.toLowerCase().includes(q)
      );
    }) ?? [];

  return (
    <div className="flex h-full flex-col border-r border-[#E5E5E5] bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E5E5] px-4 py-3">
        <h1 className="text-base font-semibold text-[#171717]">Messages</h1>
        <button
          onClick={onNewMessage}
          className="flex h-7 w-7 items-center justify-center rounded-full text-[#737373] hover:bg-[#F0F0F0]"
          aria-label="New message"
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
            <path d="M8 3v10M3 8h10" />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations…"
          className="h-8 w-full rounded-lg border border-[#E5E5E5] bg-[#F7F7F7] px-3 text-xs text-[#171717] outline-none placeholder:text-[#A3A3A3] focus:border-[#171717]"
        />
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {conversations === undefined ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12">
            <p className="text-xs text-[#737373]">
              {search ? "No conversations found" : "No conversations yet"}
            </p>
            {!search && (
              <button
                onClick={onNewMessage}
                className="text-xs font-medium text-[#00D632] hover:underline"
              >
                Start a conversation
              </button>
            )}
          </div>
        ) : (
          filtered.map((c: ConversationItem) => {
            const isActive = c._id === activeConversationId;
            return (
              <button
                key={c._id}
                onClick={() => onSelectConversation(c._id)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isActive ? "bg-[#F0F0F0]" : "hover:bg-[#F7F7F7]"
                }`}
              >
                {/* Avatar */}
                {c.otherUser?.avatarUrl ? (
                  <img
                    src={c.otherUser.avatarUrl}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E5E5E5]">
                    <span className="text-sm font-medium text-[#737373]">
                      {c.otherUser?.name.charAt(0).toUpperCase() ?? "?"}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p
                      className={`truncate text-sm ${
                        c.unreadCount > 0
                          ? "font-semibold text-[#171717]"
                          : "font-medium text-[#171717]"
                      }`}
                    >
                      {c.otherUser?.name ?? "Unknown"}
                    </p>
                    {c.lastMessageAt && (
                      <span className="ml-2 shrink-0 text-[10px] text-[#A3A3A3]">
                        {formatRelativeTime(c.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p
                      className={`truncate text-xs ${
                        c.unreadCount > 0 ? "text-[#525252]" : "text-[#A3A3A3]"
                      }`}
                    >
                      {c.lastMessagePreview ?? "No messages yet"}
                    </p>
                    {c.unreadCount > 0 && (
                      <span className="ml-2 flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[#00D632] px-1 text-[9px] font-bold text-white">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

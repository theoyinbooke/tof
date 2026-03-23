"use client";

import { useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  facilitator: "Facilitator",
  mentor: "Mentor",
  beneficiary: "Beneficiary",
};

function formatDateSeparator(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function shouldShowDateSeparator(
  currentTimestamp: number,
  previousTimestamp: number | null,
): boolean {
  if (!previousTimestamp) return true;
  const current = new Date(currentTimestamp).toDateString();
  const previous = new Date(previousTimestamp).toDateString();
  return current !== previous;
}

export function ConversationView({
  conversationId,
  otherUser,
  onBack,
}: {
  conversationId: Id<"conversations">;
  otherUser: {
    _id: Id<"users">;
    name: string;
    avatarUrl?: string;
    role: string;
  } | null;
  onBack?: () => void;
}) {
  const messages = useQuery(api.messaging.getMessages, { conversationId });
  const markRead = useMutation(api.messaging.markConversationRead);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Mark conversation as read when opened and when new messages arrive
  useEffect(() => {
    markRead({ conversationId }).catch(() => {
      // Silently ignore — the conversation will still show as read next time
    });
  }, [conversationId, messages?.length, markRead]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#E5E5E5] px-4 py-3">
        {/* Back button (mobile) */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#737373] hover:bg-[#F0F0F0] lg:hidden"
            aria-label="Back to conversations"
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
              <path d="M10 3L5 8l5 5" />
            </svg>
          </button>
        )}

        {/* Avatar */}
        {otherUser?.avatarUrl ? (
          <img
            src={otherUser.avatarUrl}
            alt=""
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E5E5E5]">
            <span className="text-sm font-medium text-[#737373]">
              {otherUser?.name.charAt(0).toUpperCase() ?? "?"}
            </span>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#171717]">
            {otherUser?.name ?? "Unknown"}
          </p>
          <p className="text-[10px] text-[#737373]">
            {ROLE_LABELS[otherUser?.role ?? ""] ?? ""}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages === undefined ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <p className="text-xs text-[#737373]">
              No messages yet. Say hello!
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => {
              const showDate = shouldShowDateSeparator(
                msg.createdAt,
                i > 0 ? messages[i - 1].createdAt : null,
              );
              return (
                <div key={msg._id}>
                  {showDate && (
                    <div className="my-3 flex items-center justify-center">
                      <span className="rounded-full bg-[#F0F0F0] px-3 py-0.5 text-[10px] font-medium text-[#737373]">
                        {formatDateSeparator(msg.createdAt)}
                      </span>
                    </div>
                  )}
                  <MessageBubble message={msg} />
                </div>
              );
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <MessageInput conversationId={conversationId} />
    </div>
  );
}

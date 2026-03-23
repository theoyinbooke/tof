"use client";

export function EmptyState({ onNewMessage }: { onNewMessage: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F0F0F0]">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#737373"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-[#171717]">No conversation selected</p>
        <p className="mt-1 text-xs text-[#737373]">
          Select a conversation or start a new one
        </p>
      </div>
      <button
        onClick={onNewMessage}
        className="rounded-lg bg-[#00D632] px-4 py-2 text-sm font-medium text-white hover:bg-[#00C02D] transition-colors"
      >
        New Message
      </button>
    </div>
  );
}

"use client";

import Image from "next/image";

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-[#E5E5E5] bg-white px-4">
      <button
        onClick={onMenuClick}
        className="flex h-10 w-10 items-center justify-center rounded-md text-[#262626] hover:bg-[#F0F0F0]"
        aria-label="Open menu"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M3 5h14M3 10h14M3 15h14" />
        </svg>
      </button>

      <Image
        src="/logo-dark.png"
        alt="TheOyinbooke Foundation"
        width={800}
        height={500}
        className="h-6 w-auto"
      />

      <div className="w-10" />
    </header>
  );
}

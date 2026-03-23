"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

type Tab = { href: string; label: string; icon: React.ComponentType<{ active?: boolean }> };

const sharedTabs: Tab[] = [
  { href: "/dashboard", label: "Home", icon: HomeIcon },
];

const roleTabs: Record<string, Tab[]> = {
  beneficiary: [
    { href: "/beneficiary/sessions", label: "Sessions", icon: CalendarIcon },
    { href: "/beneficiary/assessments", label: "Assess", icon: ClipboardIcon },
  ],
  mentor: [
    { href: "/mentor/mentees", label: "Mentees", icon: GroupIcon },
    { href: "/mentor/notes", label: "Notes", icon: NoteIcon },
  ],
  facilitator: [
    { href: "/facilitator/sessions", label: "Sessions", icon: CalendarIcon },
  ],
  admin: [
    { href: "/admin/beneficiaries", label: "Benefic.", icon: GroupIcon },
    { href: "/admin/sessions", label: "Sessions", icon: CalendarIcon },
  ],
};

const sharedEndTabs: Tab[] = [
  { href: "/messages", label: "Chat", icon: ChatBubbleIcon },
  { href: "/notifications", label: "Alerts", icon: BellIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

export function MobileNav() {
  const pathname = usePathname();
  const currentUser = useQuery(api.users.currentUser);
  const role = currentUser?.role ?? "beneficiary";
  const tabs = [...sharedTabs, ...(roleTabs[role] ?? []), ...sharedEndTabs];

  return (
    <nav className="flex h-16 items-center justify-around border-t border-[#E5E5E5] bg-white pb-[env(safe-area-inset-bottom)]">
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 ${
              isActive ? "text-[#00D632]" : "text-[#9CA3AF]"
            }`}
          >
            <tab.icon active={isActive} />
            <span className="text-[10px]">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function HomeIcon({ active }: { active?: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#00D632" : "#9CA3AF"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12l9-8 9 8" />
      <path d="M5 10v9a1 1 0 001 1h3v-5h6v5h3a1 1 0 001-1v-9" />
    </svg>
  );
}

function LibIcon({ active }: { active?: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#00D632" : "#9CA3AF"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h5l2 2h9v14H4V4z" />
    </svg>
  );
}

function BellIcon({ active }: { active?: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#00D632" : "#9CA3AF"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0112 0c0 6.5 3 8 3 8H3s3-1.5 3-8z" />
      <path d="M10 21a2 2 0 004 0" />
    </svg>
  );
}

function UserIcon({ active }: { active?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#00D632" : "#9CA3AF"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function CalendarIcon({ active }: { active?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#00D632" : "#9CA3AF"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18" />
      <path d="M8 2v4M16 2v4" />
    </svg>
  );
}

function ClipboardIcon({ active }: { active?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#00D632" : "#9CA3AF"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4h12v18H5V6l2-2z" />
      <path d="M9 10h6M9 14h4" />
    </svg>
  );
}

function GroupIcon({ active }: { active?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#00D632" : "#9CA3AF"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6" />
      <circle cx="17" cy="7" r="2.5" />
      <path d="M18 14c2.5 0 4.5 2 4.5 5" />
    </svg>
  );
}

function NoteIcon({ active }: { active?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#00D632" : "#9CA3AF"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 3h16v18H4V3z" />
      <path d="M8 8h8M8 12h8M8 16h4" />
    </svg>
  );
}

function ChatBubbleIcon({ active }: { active?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#00D632" : "#9CA3AF"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

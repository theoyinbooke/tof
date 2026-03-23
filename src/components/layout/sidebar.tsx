"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ active?: boolean }>;
};

const sharedTopItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
];

const sharedBottomItems: NavItem[] = [
  { href: "/profile", label: "Profile", icon: ProfileIcon },
  { href: "/library", label: "Library", icon: LibraryIcon },
  { href: "/messages", label: "Messages", icon: MessagesIcon },
  { href: "/notifications", label: "Notifications", icon: NotificationsIcon },
];

const roleNavItems: Record<string, NavItem[]> = {
  beneficiary: [
    { href: "/beneficiary/sessions", label: "Sessions", icon: SessionsIcon },
    { href: "/beneficiary/assessments", label: "Assessments", icon: AssessmentsIcon },
    { href: "/beneficiary/support", label: "Support", icon: SupportIcon },
    { href: "/beneficiary/education", label: "Education", icon: EducationIcon },
    { href: "/beneficiary/documents", label: "Documents", icon: DocumentsIcon },
  ],
  mentor: [
    { href: "/mentor/mentees", label: "Mentees", icon: MenteesIcon },
    { href: "/mentor/notes", label: "Notes", icon: NotesIcon },
  ],
  facilitator: [
    { href: "/facilitator/sessions", label: "Sessions", icon: SessionsIcon },
  ],
  admin: [
    { href: "/admin/users", label: "Users", icon: UsersIcon },
    { href: "/admin/beneficiaries", label: "Beneficiaries", icon: MenteesIcon },
    { href: "/admin/cohorts", label: "Cohorts", icon: CohortsIcon },
    { href: "/admin/sessions", label: "Sessions", icon: SessionsIcon },
    { href: "/admin/library", label: "Library", icon: AdminLibraryIcon },
    { href: "/admin/assessments", label: "Assessments", icon: AssessmentsIcon },
    { href: "/admin/support", label: "Support", icon: SupportIcon },
    { href: "/admin/financial", label: "Financial", icon: FinancialIcon },
    { href: "/admin/safeguarding", label: "Safeguarding", icon: SafeguardingIcon },
    { href: "/admin/reports", label: "Reports", icon: ReportsIcon },
  ],
};

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user } = useUser();
  const currentUser = useQuery(api.users.currentUser);
  const unreadCount = useQuery(
    api.notifications.getUnreadCount,
    currentUser ? {} : "skip",
  );
  const unreadMessageCount = useQuery(
    api.messaging.getTotalUnreadCount,
    currentUser ? {} : "skip",
  );

  const role = currentUser?.role ?? "beneficiary";

  return (
    <aside className="flex h-full w-[200px] flex-col border-r border-[#E5E5E5] bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5">
        <Image
          src="/logo-dark.png"
          alt="TheOyinbooke Foundation"
          width={800}
          height={500}
          className="h-6 w-auto"
        />
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto text-[#737373] lg:hidden"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {/* User profile */}
      <div className="flex flex-col items-center gap-1 border-b border-[#E5E5E5] px-4 pb-4">
        <UserButton
          appearance={{
            elements: { avatarBox: "h-14 w-14" },
          }}
        />
        <p className="mt-1 text-sm font-medium text-[#171717]">
          {user?.fullName || "User"}
        </p>
        <p className="text-xs text-[#737373]">
          {user?.primaryEmailAddress?.emailAddress || ""}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {/* Dashboard */}
        {sharedTopItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} onClose={onClose} unreadCount={unreadCount} unreadMessageCount={unreadMessageCount} />
        ))}

        {/* Role-specific section */}
        {(roleNavItems[role] ?? []).length > 0 && (
          <>
            <div className="my-2 border-t border-[#E5E5E5]" />
            <p className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-[#A3A3A3]">
              {role === "admin" ? "Admin" : role === "facilitator" ? "Facilitator" : role === "mentor" ? "Mentorship" : "My Journey"}
            </p>
            {(roleNavItems[role] ?? []).map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} onClose={onClose} unreadCount={unreadCount} unreadMessageCount={unreadMessageCount} />
            ))}
          </>
        )}

        {/* Shared bottom items */}
        <div className="my-2 border-t border-[#E5E5E5]" />
        {sharedBottomItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} onClose={onClose} unreadCount={unreadCount} unreadMessageCount={unreadMessageCount} />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#E5E5E5] px-4 py-3">
        <Link
          href="/notifications"
          className="block text-xs text-[#737373] hover:text-[#171717]"
        >
          Help
        </Link>
      </div>
    </aside>
  );
}

function DashboardIcon({ active }: { active?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke={active ? "#171717" : "#525252"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="5.5" height="5.5" rx="1" />
      <rect x="10.5" y="2" width="5.5" height="5.5" rx="1" />
      <rect x="2" y="10.5" width="5.5" height="5.5" rx="1" />
      <rect x="10.5" y="10.5" width="5.5" height="5.5" rx="1" />
    </svg>
  );
}

function ProfileIcon({ active }: { active?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke={active ? "#171717" : "#525252"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="6" r="3.5" />
      <path d="M2.5 16c0-3.5 2.9-5.5 6.5-5.5s6.5 2 6.5 5.5" />
    </svg>
  );
}

function LibraryIcon({ active }: { active?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke={active ? "#171717" : "#525252"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h5l2 2h7v10H2V3z" />
    </svg>
  );
}

function MessagesIcon({ active }: { active?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke={active ? "#171717" : "#525252"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 12a2 2 0 0 1-2 2H6l-4 3V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function NotificationsIcon({ active }: { active?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke={active ? "#171717" : "#525252"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 7a4.5 4.5 0 0 1 9 0c0 5 2 6.5 2 6.5H2.5S4.5 12 4.5 7z" />
      <path d="M7.5 15a1.5 1.5 0 0 0 3 0" />
    </svg>
  );
}

function NavLink({
  item,
  pathname,
  onClose,
  unreadCount,
  unreadMessageCount,
}: {
  item: NavItem;
  pathname: string;
  onClose?: () => void;
  unreadCount?: number;
  unreadMessageCount?: number;
}) {
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/");

  const badgeCount =
    item.href === "/notifications"
      ? unreadCount
      : item.href === "/messages"
        ? unreadMessageCount
        : undefined;

  return (
    <Link
      href={item.href}
      onClick={onClose}
      className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-sm transition-colors ${
        isActive
          ? "bg-[#F0F0F0] font-medium text-[#171717]"
          : "text-[#525252] hover:bg-[#F0F0F0]"
      }`}
    >
      <item.icon active={isActive} />
      <span className="flex-1">{item.label}</span>
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#00D632] px-1 text-[9px] font-bold text-white">
          {badgeCount}
        </span>
      )}
    </Link>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4l10 10M14 4L4 14" />
    </svg>
  );
}

function SessionsIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={active ? "#171717" : "#525252"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="14" height="13" rx="1.5" />
      <path d="M2 7h14" />
      <path d="M6 1.5v3M12 1.5v3" />
    </svg>
  );
}

function AssessmentsIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={active ? "#171717" : "#525252"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3h10v14H3V5l2-2z" />
      <path d="M6 8h6M6 11h4" />
    </svg>
  );
}

function SupportIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={active ? "#171717" : "#525252"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="7" />
      <path d="M9 12v.01M9 6a2 2 0 012 2c0 1-1.5 1.5-2 2" />
    </svg>
  );
}

function EducationIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={active ? "#171717" : "#525252"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 7l8-4 8 4-8 4-8-4z" />
      <path d="M4 9v4.5c0 1 2.2 2.5 5 2.5s5-1.5 5-2.5V9" />
    </svg>
  );
}

function DocumentsIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={active ? "#171717" : "#525252"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2h7l4 4v10H4V2z" />
      <path d="M11 2v4h4" />
    </svg>
  );
}

function MenteesIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={active ? "#171717" : "#525252"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="6" r="3" />
      <path d="M1 16c0-3 2.7-5 6-5s6 2 6 5" />
      <circle cx="13.5" cy="5.5" r="2" />
      <path d="M14 11c2 0 4 1.5 4 4" />
    </svg>
  );
}

function NotesIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={active ? "#171717" : "#525252"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2h12v14H3V2z" />
      <path d="M6 6h6M6 9h6M6 12h3" />
    </svg>
  );
}

function UsersIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={active ? "#171717" : "#525252"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="5" r="3" />
      <path d="M2 16c0-3.5 3-6 7-6s7 2.5 7 6" />
    </svg>
  );
}

function CohortsIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={active ? "#171717" : "#525252"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="7" r="2.5" />
      <circle cx="13" cy="7" r="2.5" />
      <path d="M1 15c0-2.5 1.8-4 4-4s4 1.5 4 4M9 15c0-2.5 1.8-4 4-4s4 1.5 4 4" />
    </svg>
  );
}

function FinancialIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={active ? "#171717" : "#525252"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1.5v15M5.5 4.5h5a2 2 0 010 4H6a2 2 0 000 4h6.5" />
    </svg>
  );
}

function SafeguardingIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={active ? "#171717" : "#525252"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1.5L2.5 4.5v4c0 4.5 3 7.5 6.5 9 3.5-1.5 6.5-4.5 6.5-9v-4L9 1.5z" />
    </svg>
  );
}

function AdminLibraryIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={active ? "#171717" : "#525252"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h5l2 2h7v10H2V3z" />
      <path d="M6 10h6M6 13h4" />
    </svg>
  );
}

function ReportsIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={active ? "#171717" : "#525252"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14V8M9 14V4M14 14V10" />
    </svg>
  );
}

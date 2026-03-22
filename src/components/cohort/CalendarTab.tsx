"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState, useRef, useEffect, useCallback } from "react";

interface CalendarTabProps {
  cohortId: Id<"cohorts">;
}

type SessionStatus = "draft" | "upcoming" | "active" | "completed" | "cancelled";

const STATUS_CHIP_COLORS: Record<SessionStatus, string> = {
  draft: "bg-[#F0F0F0] text-[#737373]",
  upcoming: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-[#00863B]",
  completed: "bg-[#E5E5E5] text-[#525252]",
  cancelled: "bg-red-100 text-red-600 line-through",
};

const STATUS_BADGE_COLORS: Record<SessionStatus, string> = {
  draft: "bg-[#F0F0F0] text-[#737373]",
  upcoming: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-[#00863B]",
  completed: "bg-[#E5E5E5] text-[#525252]",
  cancelled: "bg-red-100 text-red-600",
};

const ALL_STATUSES: SessionStatus[] = [
  "draft",
  "upcoming",
  "active",
  "completed",
  "cancelled",
];

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
}

function getCalendarDays(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday start
  const daysInMonth = lastDay.getDate();

  const days: CalendarDay[] = [];
  // Previous month trailing days
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, isCurrentMonth: false });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: new Date(year, month, i), isCurrentMonth: true });
  }
  // Next month leading days to fill 6 rows
  while (days.length < 42) {
    const d = new Date(
      year,
      month + 1,
      days.length - startOffset - daysInMonth + 1
    );
    days.push({ date: d, isCurrentMonth: false });
  }
  return days;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatFullDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface EnrichedSession {
  _id: Id<"sessions">;
  sessionNumber: number;
  title: string;
  pillar: string;
  description?: string;
  scheduledDate?: number;
  facilitatorId?: Id<"users">;
  cohortId?: Id<"cohorts">;
  status: SessionStatus;
  createdAt: number;
  updatedAt: number;
  facilitatorName?: string;
  enrolledCount: number;
  attendedCount: number;
  attendanceRate: number;
}

export default function CalendarTab({ cohortId }: CalendarTabProps) {
  const sessions = useQuery(api.sessions.listByCohort, { cohortId });
  const updateSession = useMutation(api.sessions.update);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState<EnrichedSession | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"month" | "list">("month");

  const popoverRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const today = new Date();

  const goToPrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };
  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };
  const goToToday = () => setCurrentDate(new Date());

  // Close popover when clicking outside
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setSelectedSession(null);
        setPopoverPos(null);
        setStatusDropdownOpen(false);
      }
    },
    []
  );

  useEffect(() => {
    if (selectedSession) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [selectedSession, handleClickOutside]);

  const handleChipClick = (
    session: EnrichedSession,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let top = rect.bottom + 8;
    let left = rect.left;

    // If popover would go off right edge (~320px wide)
    if (left + 320 > viewportW) {
      left = viewportW - 336;
    }
    if (left < 16) left = 16;

    // If popover would go off bottom (~400px tall)
    if (top + 400 > viewportH) {
      top = rect.top - 408;
      if (top < 16) top = 16;
    }

    setSelectedSession(session);
    setPopoverPos({ top, left });
    setStatusDropdownOpen(false);
  };

  const handleStatusChange = async (newStatus: SessionStatus) => {
    if (!selectedSession) return;
    await updateSession({
      sessionId: selectedSession._id,
      status: newStatus,
    });
    setSelectedSession({ ...selectedSession, status: newStatus });
    setStatusDropdownOpen(false);
  };

  // Loading state
  if (sessions === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  const typedSessions = sessions as EnrichedSession[];

  // Sessions with scheduled dates for the calendar
  const scheduledSessions = typedSessions.filter(
    (s) => s.scheduledDate !== undefined
  );

  // No sessions have scheduled dates at all
  if (scheduledSessions.length === 0) {
    return (
      <div className="rounded-xl border border-[#E5E5E5] bg-white p-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F0F0F0]">
          <svg
            className="h-6 w-6 text-[#737373]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-[#171717]">
          No sessions have been scheduled yet
        </h2>
        <p className="mt-1 text-sm text-[#737373]">
          Go to the Sessions tab to set dates.
        </p>
      </div>
    );
  }

  // Build a map of sessions by date key
  const sessionsByDate = new Map<string, EnrichedSession[]>();
  for (const session of scheduledSessions) {
    const d = new Date(session.scheduledDate!);
    const key = dateKey(d);
    if (!sessionsByDate.has(key)) {
      sessionsByDate.set(key, []);
    }
    sessionsByDate.get(key)!.push(session);
  }

  const calendarDays = getCalendarDays(currentYear, currentMonth);

  // Sessions in the currently viewed month
  const currentMonthSessions = scheduledSessions.filter((s) => {
    const d = new Date(s.scheduledDate!);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  // List view: sorted sessions for this month
  const listViewSessions = [...currentMonthSessions].sort(
    (a, b) => a.scheduledDate! - b.scheduledDate!
  );

  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-[#E5E5E5] p-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-[#171717]">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h2>

        <div className="flex items-center gap-2">
          {/* Month navigation */}
          <div className="flex items-center rounded-lg border border-[#E5E5E5]">
            <button
              onClick={goToPrevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-l-lg text-[#525252] hover:bg-[#F7F7F7]"
              aria-label="Previous month"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={goToToday}
              className="border-x border-[#E5E5E5] px-3 py-1 text-xs font-medium text-[#525252] hover:bg-[#F7F7F7]"
            >
              Today
            </button>
            <button
              onClick={goToNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-r-lg text-[#525252] hover:bg-[#F7F7F7]"
              aria-label="Next month"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

          {/* View toggle */}
          <div className="flex rounded-lg border border-[#E5E5E5]">
            <button
              onClick={() => setViewMode("month")}
              className={`rounded-l-lg px-3 py-1 text-xs font-medium ${
                viewMode === "month"
                  ? "bg-[#171717] text-white"
                  : "text-[#525252] hover:bg-[#F7F7F7]"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-r-lg px-3 py-1 text-xs font-medium ${
                viewMode === "list"
                  ? "bg-[#171717] text-white"
                  : "text-[#525252] hover:bg-[#F7F7F7]"
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Month Grid View */}
      {viewMode === "month" && (
        <div className="p-2 sm:p-4">
          {/* Day-of-week column headers */}
          <div className="grid grid-cols-7 border-b border-[#E5E5E5] pb-2">
            {DAY_NAMES.map((day) => (
              <div
                key={day}
                className="text-center text-[11px] font-medium uppercase tracking-wider text-[#737373]"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {calendarDays.map((calDay, idx) => {
              const key = dateKey(calDay.date);
              const daySessions = sessionsByDate.get(key) || [];
              const isToday = isSameDay(calDay.date, today);

              return (
                <div
                  key={idx}
                  className={`min-h-[60px] border-b border-r border-[#E5E5E5] p-1 transition-colors hover:bg-[#F7F7F7] sm:min-h-[100px] sm:p-2 ${
                    !calDay.isCurrentMonth ? "bg-[#FAFAFA]" : ""
                  } ${idx % 7 === 0 ? "border-l" : ""} ${idx < 7 ? "border-t" : ""}`}
                >
                  {/* Day number */}
                  <div className="mb-1">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                        isToday
                          ? "ring-2 ring-[#00D632] bg-[#E6FBF0] font-semibold text-[#00863B]"
                          : calDay.isCurrentMonth
                            ? "text-[#525252]"
                            : "text-[#D4D4D4]"
                      }`}
                    >
                      {calDay.date.getDate()}
                    </span>
                  </div>

                  {/* Session chips */}
                  <div className="flex flex-col gap-0.5">
                    {daySessions.map((session) => (
                      <button
                        key={session._id}
                        onClick={(e) => handleChipClick(session, e)}
                        className={`w-full truncate rounded-md px-1.5 py-0.5 text-left text-[10px] leading-tight sm:px-2 sm:py-1 sm:text-xs ${STATUS_CHIP_COLORS[session.status]} cursor-pointer transition-opacity hover:opacity-80`}
                      >
                        {/* On mobile show only session number */}
                        <span className="sm:hidden">S{session.sessionNumber}</span>
                        <span className="hidden sm:inline">
                          S{session.sessionNumber}: {session.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* No sessions this month */}
          {currentMonthSessions.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-[#737373]">
                No sessions scheduled this month.
              </p>
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="p-4">
          {listViewSessions.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-[#737373]">
                No sessions scheduled this month.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E5E5]">
              {listViewSessions.map((session) => {
                const d = new Date(session.scheduledDate!);
                return (
                  <button
                    key={session._id}
                    onClick={(e) => handleChipClick(session, e)}
                    className="flex w-full items-center gap-4 px-2 py-3 text-left transition-colors hover:bg-[#F7F7F7]"
                  >
                    {/* Date badge */}
                    <div className="flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-[#F7F7F7]">
                      <span className="text-[10px] font-medium uppercase text-[#737373]">
                        {d.toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-sm font-semibold text-[#171717]">
                        {d.getDate()}
                      </span>
                    </div>

                    {/* Session info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-[#171717]">
                          S{session.sessionNumber}: {session.title}
                        </span>
                        <span
                          className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_BADGE_COLORS[session.status]}`}
                        >
                          {session.status}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-[#737373]">
                        <span>{session.pillar}</span>
                        <span>{session.facilitatorName || "Unassigned"}</span>
                        <span>{session.enrolledCount} enrolled</span>
                      </div>
                    </div>

                    {/* Time */}
                    <span className="flex-shrink-0 text-xs text-[#737373]">
                      {d.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Session Detail Popover */}
      {selectedSession && popoverPos && (
        <div
          ref={popoverRef}
          className="fixed z-50 w-[calc(100vw-32px)] max-w-xs rounded-xl border border-[#E5E5E5] bg-white shadow-lg sm:w-80"
          style={{ top: popoverPos.top, left: popoverPos.left }}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#E5E5E5] p-4">
            <div className="min-w-0 flex-1 pr-2">
              <h3 className="truncate text-sm font-semibold text-[#171717]">
                {selectedSession.title}
              </h3>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-[#737373]">
                  Session {selectedSession.sessionNumber}
                </span>
                <span className="rounded-md bg-[#F0F0F0] px-1.5 py-0.5 text-[10px] font-medium text-[#525252]">
                  {selectedSession.pillar}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedSession(null);
                setPopoverPos(null);
                setStatusDropdownOpen(false);
              }}
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-[#737373] hover:bg-[#F0F0F0]"
              aria-label="Close"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Details */}
          <div className="space-y-3 p-4">
            {/* Scheduled date */}
            {selectedSession.scheduledDate && (
              <div className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#737373]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>
                <span className="text-xs text-[#525252]">
                  {formatFullDate(selectedSession.scheduledDate)}
                </span>
              </div>
            )}

            {/* Status */}
            <div className="flex items-center gap-2">
              <svg
                className="h-3.5 w-3.5 flex-shrink-0 text-[#737373]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_BADGE_COLORS[selectedSession.status]}`}
              >
                {selectedSession.status}
              </span>
            </div>

            {/* Facilitator */}
            <div className="flex items-center gap-2">
              <svg
                className="h-3.5 w-3.5 flex-shrink-0 text-[#737373]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
              <span className="text-xs text-[#525252]">
                {selectedSession.facilitatorName || "Unassigned"}
              </span>
            </div>

            {/* Enrolled */}
            <div className="flex items-center gap-2">
              <svg
                className="h-3.5 w-3.5 flex-shrink-0 text-[#737373]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
              </svg>
              <span className="text-xs text-[#525252]">
                {selectedSession.enrolledCount} enrolled
              </span>
            </div>

            {/* Attendance rate -- only shown for completed sessions */}
            {selectedSession.status === "completed" && (
              <div className="flex items-center gap-2">
                <svg
                  className="h-3.5 w-3.5 flex-shrink-0 text-[#737373]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                  />
                </svg>
                <span className="text-xs text-[#525252]">
                  {selectedSession.attendanceRate}% attendance ({selectedSession.attendedCount}/{selectedSession.enrolledCount})
                </span>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="border-t border-[#E5E5E5] p-3">
            <div className="flex items-center gap-2">
              {/* View Session */}
              <a
                href={`/admin/sessions/${selectedSession._id}`}
                className="flex-1 rounded-md bg-[#171717] px-3 py-2 text-center text-xs font-medium text-white hover:bg-[#262626]"
              >
                View Session
              </a>

              {/* Change Status dropdown */}
              <div className="relative" ref={statusDropdownRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatusDropdownOpen(!statusDropdownOpen);
                  }}
                  className="rounded-md border border-[#E5E5E5] px-3 py-2 text-xs font-medium text-[#525252] hover:bg-[#F7F7F7]"
                >
                  Status
                  <svg className="ml-1 inline-block h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {statusDropdownOpen && (
                  <div className="absolute bottom-full right-0 z-10 mb-1 w-36 rounded-lg border border-[#E5E5E5] bg-white py-1 shadow-md">
                    {ALL_STATUSES.map((status) => (
                      <button
                        key={status}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(status);
                        }}
                        className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-[#F7F7F7] ${
                          selectedSession.status === status
                            ? "font-medium text-[#171717]"
                            : "text-[#525252]"
                        }`}
                      >
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${
                            status === "draft"
                              ? "bg-[#D4D4D4]"
                              : status === "upcoming"
                                ? "bg-blue-500"
                                : status === "active"
                                  ? "bg-[#00D632]"
                                  : status === "completed"
                                    ? "bg-[#737373]"
                                    : "bg-red-500"
                          }`}
                        />
                        <span className="capitalize">{status}</span>
                        {selectedSession.status === status && (
                          <svg className="ml-auto h-3 w-3 text-[#00D632]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

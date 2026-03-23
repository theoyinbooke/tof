"use client";

import { useState, useMemo } from "react";

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface TimelineTabProps {
  events: TimelineEvent[];
}

const EVENT_COLORS: Record<string, { bg: string; dot: string; text: string; label: string }> = {
  attendance: { bg: "bg-blue-50", dot: "bg-blue-500", text: "text-blue-600", label: "Attendance" },
  support: { bg: "bg-purple-50", dot: "bg-purple-500", text: "text-purple-600", label: "Support" },
  assessment: { bg: "bg-[#E6FBF0]", dot: "bg-[#00D632]", text: "text-[#00D632]", label: "Assessment" },
  education: { bg: "bg-yellow-50", dot: "bg-yellow-500", text: "text-yellow-600", label: "Education" },
};

function formatMonthYear(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-NG", {
    month: "long",
    year: "numeric",
  });
}

function formatFullDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
  });
}

function humanizeKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

function formatMetaValue(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function TimelineTab({ events }: TimelineTabProps) {
  const [selectedId, setSelectedId] = useState<string | null>(events[0]?.id ?? null);

  const grouped = useMemo(() => {
    const groups: Array<{ label: string; events: TimelineEvent[] }> = [];
    let currentLabel = "";

    for (const event of events) {
      const label = formatMonthYear(event.timestamp);
      if (label !== currentLabel) {
        groups.push({ label, events: [] });
        currentLabel = label;
      }
      groups[groups.length - 1].events.push(event);
    }

    return groups;
  }, [events]);

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedId) ?? null,
    [events, selectedId],
  );

  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
        <p className="text-sm text-[#737373]">No events.</p>
      </div>
    );
  }

  const selectedColor = selectedEvent
    ? EVENT_COLORS[selectedEvent.type] || { bg: "bg-[#F0F0F0]", dot: "bg-[#737373]", text: "text-[#525252]", label: selectedEvent.type }
    : null;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-0">
      {/* Left Panel — Timeline List */}
      <div className="w-full overflow-y-auto rounded-xl border border-[#E5E5E5] bg-white lg:w-[40%] lg:rounded-r-none lg:border-r-0" style={{ maxHeight: "calc(100vh - 280px)" }}>
        {grouped.map((group) => (
          <div key={group.label}>
            {/* Month header */}
            <div className="sticky top-0 z-10 border-b border-[#F0F0F0] bg-[#F7F7F7] px-4 py-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-[#737373]">
                {group.label}
              </p>
            </div>

            {/* Events with connector line */}
            <div className="relative pl-4">
              {/* Vertical line */}
              <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-[#E5E5E5]" />

              {group.events.map((event) => {
                const color = EVENT_COLORS[event.type] || { bg: "bg-[#F0F0F0]", dot: "bg-[#737373]", text: "text-[#525252]", label: event.type };
                const isSelected = event.id === selectedId;

                return (
                  <button
                    key={event.id}
                    onClick={() => setSelectedId(event.id)}
                    className={`relative flex w-full items-start gap-3 px-3 py-3 text-left transition-colors ${
                      isSelected
                        ? "bg-[#F0F0F0]"
                        : "hover:bg-[#F7F7F7]"
                    }`}
                  >
                    {/* Green accent bar for selected */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#00D632]" />
                    )}

                    {/* Colored dot */}
                    <div
                      className={`relative z-10 mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 border-white ${color.dot}`}
                    >
                      <span className="text-[8px] font-bold text-white">
                        {event.type[0].toUpperCase()}
                      </span>
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#171717]">{event.title}</p>
                      <p className="mt-0.5 text-[10px] text-[#D4D4D4]">
                        {formatShortDate(event.timestamp)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Right Panel — Detail View */}
      <div
        className="w-full overflow-y-auto rounded-xl border border-[#E5E5E5] bg-white lg:w-[60%] lg:rounded-l-none"
        style={{ maxHeight: "calc(100vh - 280px)" }}
      >
        {selectedEvent && selectedColor ? (
          <div className="p-6">
            {/* Type badge */}
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${selectedColor.bg} ${selectedColor.text}`}
            >
              {selectedColor.label}
            </span>

            {/* Title */}
            <h3 className="mt-3 text-lg font-semibold text-[#171717]">{selectedEvent.title}</h3>

            {/* Date/Time */}
            <p className="mt-1 text-sm text-[#737373]">
              {formatFullDate(selectedEvent.timestamp)} at {formatTime(selectedEvent.timestamp)}
            </p>

            {/* Divider */}
            <div className="my-4 border-t border-[#F0F0F0]" />

            {/* Description */}
            <p className="text-sm leading-relaxed text-[#525252]">{selectedEvent.description}</p>

            {/* Metadata */}
            {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
              <>
                <div className="my-4 border-t border-[#F0F0F0]" />
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#737373]">
                  Details
                </p>
                <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  {Object.entries(selectedEvent.metadata).map(([key, value]) => {
                    const display = formatMetaValue(value);
                    if (!display) return null;
                    return (
                      <div key={key}>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-[#737373]">
                          {humanizeKey(key)}
                        </p>
                        <p className="mt-0.5 text-sm text-[#171717]">{display}</p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center p-6">
            <p className="text-sm text-[#737373]">Select an event to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
}

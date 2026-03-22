"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useState } from "react";

export function OnboardingChecklist() {
  const status = useQuery(api.analytics.getOnboardingStatus);
  const [dismissed, setDismissed] = useState(false);

  // Don't render if: loading, not admin, all done, or manually dismissed
  if (status === undefined || status === null || status.allDone || dismissed) {
    return null;
  }

  const progress = Math.round((status.completedCount / status.total) * 100);

  return (
    <div className="rounded-xl border border-[#00D632]/30 bg-gradient-to-br from-[#E6FBF0] to-white p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00D632]">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M4 10l4 4 8-8" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#171717]">
              Get your platform ready
            </h2>
            <p className="text-sm text-[#737373]">
              {status.completedCount} of {status.total} steps completed
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="rounded-md p-1.5 text-[#737373] hover:bg-white/60 hover:text-[#171717]"
          title="Dismiss for now"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#E5E5E5]">
        <div
          className="h-full rounded-full bg-[#00D632] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="mt-5 space-y-1">
        {status.steps.map((step) => (
          <Link
            key={step.id}
            href={step.href}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
              step.done
                ? "opacity-60"
                : "hover:bg-white/80"
            }`}
          >
            {/* Checkbox */}
            {step.done ? (
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00D632]">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 6l2.5 2.5 4.5-4.5" />
                </svg>
              </div>
            ) : (
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#D4D4D4] group-hover:border-[#00D632]" />
            )}

            {/* Label */}
            <span
              className={`text-sm ${
                step.done
                  ? "text-[#737373] line-through"
                  : "font-medium text-[#171717]"
              }`}
            >
              {step.label}
            </span>

            {/* Arrow for incomplete steps */}
            {!step.done && (
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="#D4D4D4"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="ml-auto opacity-0 transition-opacity group-hover:opacity-100"
              >
                <path d="M5 3l4 4-4 4" />
              </svg>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

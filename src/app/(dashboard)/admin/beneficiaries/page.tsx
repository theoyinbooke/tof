"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";
import { useState } from "react";
import {
  ErrorToast,
  SuccessToast,
} from "@/components/ui/mutation-error-toast";

type LifecycleStatus =
  | "applicant"
  | "active"
  | "paused"
  | "completed"
  | "alumni"
  | "withdrawn";

const STATUS_OPTIONS: { label: string; value: LifecycleStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Applicant", value: "applicant" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Completed", value: "completed" },
  { label: "Alumni", value: "alumni" },
  { label: "Withdrawn", value: "withdrawn" },
];

export default function AdminBeneficiariesPage() {
  const [statusFilter, setStatusFilter] = useState<
    LifecycleStatus | "all"
  >("all");
  const [isReconciling, setIsReconciling] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const beneficiaries = useQuery(api.beneficiaries.listBeneficiaries, {
    lifecycleStatus:
      statusFilter === "all" ? undefined : statusFilter,
  });

  const handleReconcile = async () => {
    setIsReconciling(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch("/api/admin/reconcile-beneficiaries", {
        method: "POST",
      });

      const payload = (await response.json()) as {
        error?: string;
        syncSummary?: { synced: number; failed: number };
        reconcileSummary?: {
          createdProfiles?: Array<unknown>;
          deletedProfiles?: Array<unknown>;
          renamedUsers?: Array<unknown>;
        };
      };

      if (!response.ok) {
        throw new Error(payload.error || "Failed to reconcile beneficiaries.");
      }

      const createdCount = payload.reconcileSummary?.createdProfiles?.length ?? 0;
      const deletedCount = payload.reconcileSummary?.deletedProfiles?.length ?? 0;
      const renamedCount = payload.reconcileSummary?.renamedUsers?.length ?? 0;
      const syncedCount = payload.syncSummary?.synced ?? 0;

      setSuccessMsg(
        `Reconciled directory. Synced ${syncedCount} users, created ${createdCount} profiles, removed ${deletedCount} invalid profiles, updated ${renamedCount} names.`,
      );
      setTimeout(() => setSuccessMsg(null), 6000);
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Failed to reconcile beneficiaries.",
      );
      setTimeout(() => setErrorMsg(null), 6000);
    } finally {
      setIsReconciling(false);
    }
  };

  if (beneficiaries === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      {successMsg && (
        <SuccessToast
          message={successMsg}
          onClose={() => setSuccessMsg(null)}
        />
      )}
      {errorMsg && (
        <ErrorToast
          message={errorMsg}
          onClose={() => setErrorMsg(null)}
        />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-[#171717]">Beneficiaries</h1>
          <span className="text-sm text-[#737373]">
            {beneficiaries.length} total
          </span>
        </div>
        <button
          onClick={handleReconcile}
          disabled={isReconciling}
          className="inline-flex items-center justify-center rounded-md border border-[#171717] px-3 py-2 text-sm font-medium text-[#171717] transition-colors hover:bg-[#171717] hover:text-white disabled:cursor-not-allowed disabled:border-[#D4D4D4] disabled:text-[#A3A3A3] disabled:hover:bg-transparent disabled:hover:text-[#A3A3A3]"
        >
          {isReconciling ? "Reconciling..." : "Reconcile Directory"}
        </button>
      </div>

      {/* Status filter */}
      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === opt.value
                ? "bg-[#171717] text-white"
                : "bg-[#F0F0F0] text-[#525252] hover:bg-[#E5E5E5]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* List */}
      {beneficiaries.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E6FBF0]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D632" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <h2 className="mt-4 text-base font-semibold text-[#171717]">No beneficiaries</h2>
          <p className="mt-1 text-sm text-[#737373]">No beneficiary profiles match this filter.</p>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
          {beneficiaries.map((b, i) => (
            <Link
              key={b._id}
              href={`/admin/beneficiaries/${b._id}`}
              className={`flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-[#F7F7F7] ${
                i > 0 ? "border-t border-[#F0F0F0]" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E6FBF0] text-xs font-medium text-[#00D632]">
                  {(b.firstName?.[0] || b.user?.name?.[0] || "?").toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-[#171717]">
                    {b.firstName && b.lastName
                      ? `${b.firstName} ${b.lastName}`
                      : b.user?.name || "Unnamed"}
                  </p>
                  <p className="text-xs text-[#737373]">
                    {b.user?.email || "No email"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full border border-[#E5E5E5] px-2.5 py-0.5 text-xs text-[#525252]">
                  {b.lifecycleStatus}
                </span>
                <span className="text-xs text-[#737373]">
                  {b.profileCompletionPercent}%
                </span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#D4D4D4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 3l4 4-4 4" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

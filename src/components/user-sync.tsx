"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { ReactNode } from "react";

/**
 * Blocks authenticated dashboard UI until Convex auth is ready and a matching
 * user record exists in Convex. This avoids race conditions where protected
 * queries mount before the Clerk JWT or user bootstrap is complete.
 */
export function UserSyncGate({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useUser();
  const { isLoading: convexAuthLoading, isAuthenticated: convexAuthenticated } =
    useConvexAuth();
  const convexUser = useQuery(
    api.users.currentUser,
    isLoaded && isSignedIn && convexAuthenticated ? {} : "skip",
  );
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);
  const attemptedSync = useRef(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || convexAuthLoading || !convexAuthenticated) {
      return;
    }

    if (convexUser) {
      attemptedSync.current = false;
      return;
    }

    if (convexUser === null && !attemptedSync.current) {
      attemptedSync.current = true;
      getOrCreateUser().catch((err) => {
        attemptedSync.current = false;
        setSyncError(err instanceof Error ? err.message : "Failed to sync user.");
        console.error("Failed to sync user to Convex:", err);
      });
    }
  }, [
    convexAuthLoading,
    convexAuthenticated,
    convexUser,
    getOrCreateUser,
    isLoaded,
    isSignedIn,
  ]);

  if (!isLoaded || convexAuthLoading) {
    return <LoadingState label="Preparing your session..." />;
  }

  if (!isSignedIn) {
    return <>{children}</>;
  }

  if (!convexAuthenticated || convexUser === undefined || convexUser === null) {
    if (syncError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="max-w-md rounded-2xl border border-[#E5E5E5] bg-white p-6 text-center shadow-sm">
            <h2 className="text-base font-semibold text-[#171717]">
              We could not finish signing you in
            </h2>
            <p className="mt-2 text-sm text-[#737373]">
              {syncError}. Refresh the page and try again.
            </p>
          </div>
        </div>
      );
    }

    return <LoadingState label="Finishing account setup..." />;
  }

  return <>{children}</>;
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#E5E5E5] bg-white px-8 py-10 shadow-sm">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
        <p className="text-sm text-[#737373]">{label}</p>
      </div>
    </div>
  );
}

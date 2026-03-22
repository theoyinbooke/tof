"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Unauthorized } from "@/components/ui/unauthorized";
import type { ReactNode } from "react";

type Role = "admin" | "facilitator" | "mentor" | "beneficiary";

export function RoleGuard({
  allowed,
  children,
}: {
  allowed: Role[];
  children: ReactNode;
}) {
  const user = useQuery(api.users.currentUser);

  if (user === undefined) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  if (user === null || !allowed.includes(user.role)) {
    return <Unauthorized />;
  }

  return <>{children}</>;
}

"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { BeneficiaryDashboard } from "@/components/dashboards/beneficiary-dashboard";
import { AdminDashboard } from "@/components/dashboards/admin-dashboard";
import { MentorDashboard } from "@/components/dashboards/mentor-dashboard";
import { FacilitatorDashboard } from "@/components/dashboards/facilitator-dashboard";

export default function DashboardPage() {
  const user = useQuery(api.users.currentUser);

  if (user === undefined || user === null) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" />
      </div>
    );
  }

  switch (user.role) {
    case "admin":
      return <AdminDashboard />;
    case "mentor":
      return <MentorDashboard />;
    case "facilitator":
      return <FacilitatorDashboard />;
    case "beneficiary":
    default:
      return <BeneficiaryDashboard />;
  }
}

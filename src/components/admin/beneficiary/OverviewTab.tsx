"use client";

import { Id } from "../../../../convex/_generated/dataModel";
import { ProfilePictureUpload } from "./ProfilePictureUpload";

interface OverviewTabProps {
  user: { _id: Id<"users">; name: string; email: string; avatarUrl?: string };
  profile: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
    address?: string;
    stateOfOrigin?: string;
    lga?: string;
    guardianName?: string;
    guardianPhone?: string;
    guardianRelationship?: string;
    familySize?: number;
    householdIncome?: string;
  } | null;
  profilePictureUrl: string | null;
  attendanceStats: { present: number; total: number; rate: number };
  assessmentCount: number;
  supportCount: number;
  notesCount: number;
  pillarIndicators:
    | Array<{ pillar: string; average: number; count: number; latest: number }>
    | undefined;
  userId: Id<"users">;
}

function InfoField({ label, value }: { label: string; value?: string | number | null }) {
  const display = value !== undefined && value !== null && value !== "" ? String(value) : null;
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-[#737373]">{label}</p>
      <p className={`mt-0.5 text-sm ${display ? "text-[#171717]" : "text-[#D4D4D4]"}`}>
        {display || "Not provided"}
      </p>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#171717]">{value}</p>
      <p className="mt-0.5 text-xs text-[#737373]">{sub}</p>
    </div>
  );
}

export function OverviewTab({
  user,
  profile,
  profilePictureUrl,
  attendanceStats,
  assessmentCount,
  supportCount,
  notesCount,
  pillarIndicators,
  userId,
}: OverviewTabProps) {
  const displayName =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : user.name;

  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
        <div className="flex flex-col gap-6 sm:flex-row">
          {/* Avatar */}
          <ProfilePictureUpload
            profilePictureUrl={profilePictureUrl}
            userAvatarUrl={user.avatarUrl}
            userName={displayName}
            userId={userId}
          />

          {/* Bio-data */}
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-[#171717]">{displayName}</h2>
            <p className="mt-0.5 text-sm text-[#737373]">{user.email}</p>

            <div className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoField label="Phone" value={profile?.phone} />
              <InfoField label="Date of Birth" value={profile?.dateOfBirth} />
              <InfoField label="Gender" value={profile?.gender} />
              <InfoField label="State of Origin" value={profile?.stateOfOrigin} />
              <InfoField label="LGA" value={profile?.lga} />
            </div>

            {profile?.address && (
              <div className="mt-3">
                <InfoField label="Address" value={profile.address} />
              </div>
            )}
            {!profile?.address && (
              <div className="mt-3">
                <InfoField label="Address" value={undefined} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Family Context */}
      <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">
          Family Context
        </p>
        <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoField label="Guardian Name" value={profile?.guardianName} />
          <InfoField label="Guardian Phone" value={profile?.guardianPhone} />
          <InfoField label="Relationship" value={profile?.guardianRelationship} />
          <InfoField label="Family Size" value={profile?.familySize} />
          <InfoField label="Household Income" value={profile?.householdIncome} />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Attendance"
          value={`${attendanceStats.rate}%`}
          sub={`${attendanceStats.present}/${attendanceStats.total}`}
        />
        <StatCard label="Assessments" value={String(assessmentCount)} sub="completed" />
        <StatCard label="Support" value={String(supportCount)} sub="requests" />
        <StatCard label="Notes" value={String(notesCount)} sub="mentor notes" />
      </div>

      {/* Pillar Indicators */}
      {pillarIndicators && pillarIndicators.length > 0 && (
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">
            Pillar Indicators
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {pillarIndicators.map((p) => (
              <div key={p.pillar} className="rounded-lg border border-[#F0F0F0] px-3 py-2">
                <p className="text-xs text-[#737373] capitalize">
                  {p.pillar.replace("_", " ")}
                </p>
                <p className="mt-1 text-lg font-semibold text-[#171717]">{p.average}</p>
                <p className="text-[10px] text-[#D4D4D4]">{p.count} assessments</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

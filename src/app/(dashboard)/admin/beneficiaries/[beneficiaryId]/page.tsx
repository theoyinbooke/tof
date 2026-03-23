"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { use, useState } from "react";
import Link from "next/link";
import { OverviewTab } from "../../../../../components/admin/beneficiary/OverviewTab";
import { TimelineTab } from "../../../../../components/admin/beneficiary/TimelineTab";

type Tab = "overview" | "education" | "attendance" | "assessments" | "support" | "timeline";

export default function AdminBeneficiaryDetailPage({ params }: { params: Promise<{ beneficiaryId: string }> }) {
  const { beneficiaryId } = use(params);

  // Try to look up as profile ID first, then use as user ID
  const beneficiaries = useQuery(api.beneficiaries.listBeneficiaries, {});
  const profile = beneficiaries?.find((b) => b._id === beneficiaryId);
  const userId = profile?.userId || (beneficiaryId as Id<"users">);

  const devProfile = useQuery(api.analytics.getDevelopmentProfile, { userId });
  const growthData = useQuery(api.analytics.getGrowthData, { userId });
  const pillarIndicators = useQuery(api.analytics.getPillarIndicators, { userId });
  const timeline = useQuery(api.analytics.getTimeline, { userId });
  const profilePictureUrl = useQuery(api.beneficiaries.getProfilePictureUrl, { userId });

  const [tab, setTab] = useState<Tab>("overview");

  if (devProfile === undefined) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#00D632]" /></div>;
  }

  if (!devProfile.user) {
    return <div className="p-6 lg:p-10"><Link href="/admin/beneficiaries" className="text-sm text-[#737373]">&larr; Back</Link><p className="mt-8 text-center">Not found.</p></div>;
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "education", label: "Education" },
    { key: "attendance", label: "Attendance" },
    { key: "assessments", label: "Assessments" },
    { key: "support", label: "Support" },
    { key: "timeline", label: "Timeline" },
  ];

  return (
    <div className="p-6 lg:p-10">
      <Link href="/admin/beneficiaries" className="text-sm text-[#737373] hover:text-[#171717]">&larr; Back</Link>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-[#171717] truncate">{devProfile.user.name}</h1>
          <p className="mt-0.5 text-sm text-[#737373] truncate">{devProfile.user.email}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {devProfile.profile && (
            <>
              <div className="h-2 w-20 overflow-hidden rounded-full bg-[#E5E5E5]">
                <div className="h-full rounded-full bg-[#00D632]" style={{ width: `${devProfile.profile.profileCompletionPercent}%` }} />
              </div>
              <span className="text-xs text-[#737373]">{devProfile.profile.profileCompletionPercent}%</span>
              <span className="rounded-full border border-[#E5E5E5] px-2 py-0.5 text-[10px] text-[#525252]">{devProfile.profile.lifecycleStatus}</span>
            </>
          )}
        </div>
      </div>

      {/* Mentor info */}
      {devProfile.mentor && (
        <p className="mt-2 text-xs text-[#737373]">Mentor: {devProfile.mentor.name}</p>
      )}

      {/* Tabs */}
      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-[#E5E5E5]">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors ${tab === t.key ? "border-b-2 border-[#171717] text-[#171717]" : "text-[#737373] hover:text-[#171717]"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "overview" && (
          <OverviewTab
            user={devProfile.user}
            profile={devProfile.profile}
            profilePictureUrl={profilePictureUrl ?? null}
            attendanceStats={devProfile.attendanceStats}
            assessmentCount={devProfile.assessmentScores.length}
            supportCount={devProfile.supportRequests.length}
            notesCount={devProfile.notes.length}
            pillarIndicators={pillarIndicators}
            userId={userId}
          />
        )}

        {tab === "education" && (
          <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
            {devProfile.education.length === 0 ? (
              <p className="text-sm text-[#737373]">No education records.</p>
            ) : (
              <div className="space-y-3">
                {devProfile.education.map((e) => (
                  <div key={e._id} className="flex items-center justify-between rounded-lg border border-[#F0F0F0] px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#171717] uppercase truncate">{e.stage}</p>
                      <p className="text-xs text-[#737373] truncate">{e.institutionName || "No institution"} {e.startYear ? `(${e.startYear}–${e.endYear || "present"})` : ""}</p>
                    </div>
                    {e.isCurrent && <span className="rounded-full bg-[#00D632] px-2 py-0.5 text-[10px] font-medium text-white">Current</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "attendance" && (
          <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
            <div className="mb-4 flex items-center gap-4">
              <div>
                <span className="text-xs text-[#737373]">Rate: </span>
                <span className="text-sm font-semibold text-[#171717]">{devProfile.attendanceStats.rate}%</span>
                <span className="text-xs text-[#737373]"> {devProfile.attendanceStats.present} present</span>
              </div>
            </div>
            {devProfile.attendance.length === 0 ? (
              <p className="text-sm text-[#737373]">No attendance records.</p>
            ) : (
              <div className="space-y-2">
                {devProfile.attendance.map((a) => (
                  <div key={a._id} className="flex items-center justify-between rounded-lg border border-[#F0F0F0] px-3 py-2">
                    <p className="text-sm text-[#171717] min-w-0 truncate mr-2">#{a.sessionNumber} {a.sessionTitle}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${a.status === "present" ? "bg-[#E6FBF0] text-[#00D632]" : a.status === "absent" ? "bg-red-50 text-red-600" : "bg-yellow-50 text-yellow-600"}`}>
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "assessments" && (
          <div className="space-y-4">
            {growthData && Object.keys(growthData).length > 0 && (
              <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Growth by Instrument</p>
                <div className="mt-4 space-y-4">
                  {Object.entries(growthData).map(([code, entries]) => (
                    <div key={code}>
                      <p className="text-sm font-medium text-[#171717]">{code} — {entries[0]?.name}</p>
                      <div className="mt-2 flex items-end gap-1">
                        {entries.map((e, i) => {
                          const maxScore = Math.max(...entries.map((x) => x.totalScore ?? 0));
                          const score = e.totalScore ?? 0;
                          const height = maxScore > 0 ? Math.max(8, (score / maxScore) * 48) : 8;
                          return (
                            <div key={i} className="group relative flex flex-col items-center">
                              <div className="rounded-sm bg-[#00D632]" style={{ width: 24, height }} title={`${score} — ${new Date(e.scoredAt).toLocaleDateString()}`} />
                              <p className="mt-1 text-[8px] text-[#D4D4D4]">{score}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">All Scores</p>
              {devProfile.assessmentScores.length === 0 ? (
                <p className="mt-4 text-sm text-[#737373]">No scores.</p>
              ) : (
                <div className="mt-4 space-y-2">
                  {devProfile.assessmentScores.map((s) => (
                    <div key={s._id} className="flex items-center justify-between rounded-lg border border-[#F0F0F0] px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-[#171717] truncate">{s.templateShortCode}: {s.totalScore}</p>
                        <p className="text-xs text-[#737373]">{new Date(s.scoredAt).toLocaleDateString()}</p>
                      </div>
                      {s.severityBand && <span className="rounded-full bg-[#F0F0F0] px-2 py-0.5 text-[10px] text-[#525252]">{s.severityBand}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "support" && (
          <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
            {devProfile.supportRequests.length === 0 ? (
              <p className="text-sm text-[#737373]">No support requests.</p>
            ) : (
              <div className="space-y-2">
                {devProfile.supportRequests.map((r) => (
                  <Link key={r._id} href={`/admin/support/${r._id}`}
                    className="flex items-center justify-between rounded-lg border border-[#F0F0F0] px-3 py-2 hover:bg-[#F7F7F7]">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#171717] truncate">{r.title}</p>
                      <p className="text-xs text-[#737373] truncate">{r.category} {r.amountRequested ? `· ₦${r.amountRequested.toLocaleString()}` : ""}</p>
                    </div>
                    <span className="rounded-full bg-[#F0F0F0] px-2 py-0.5 text-[10px] text-[#525252]">{r.status.replace(/_/g, " ")}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "timeline" && (
          <TimelineTab events={timeline ?? []} />
        )}
      </div>
    </div>
  );
}

"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { use, useState } from "react";
import Link from "next/link";

type Tab = "overview" | "education" | "attendance" | "assessments" | "support" | "timeline";

const EVENT_COLORS: Record<string, { bg: string; text: string }> = {
  attendance: { bg: "bg-blue-50", text: "text-blue-600" },
  support: { bg: "bg-purple-50", text: "text-purple-600" },
  assessment: { bg: "bg-[#E6FBF0]", text: "text-[#00D632]" },
  education: { bg: "bg-yellow-50", text: "text-yellow-600" },
};

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

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#171717]">{devProfile.user.name}</h1>
          <p className="mt-0.5 text-sm text-[#737373]">{devProfile.user.email}</p>
        </div>
        <div className="flex items-center gap-2">
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Attendance" value={`${devProfile.attendanceStats.rate}%`} sub={`${devProfile.attendanceStats.present}/${devProfile.attendanceStats.total}`} />
            <StatCard label="Assessments" value={String(devProfile.assessmentScores.length)} sub="completed" />
            <StatCard label="Support" value={String(devProfile.supportRequests.length)} sub="requests" />
            <StatCard label="Notes" value={String(devProfile.notes.length)} sub="mentor notes" />

            {/* Pillar indicators */}
            {pillarIndicators && pillarIndicators.length > 0 && (
              <div className="col-span-full rounded-xl border border-[#E5E5E5] bg-white p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">Pillar Indicators</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {pillarIndicators.map((p) => (
                    <div key={p.pillar} className="rounded-lg border border-[#F0F0F0] px-3 py-2">
                      <p className="text-xs text-[#737373] capitalize">{p.pillar.replace("_", " ")}</p>
                      <p className="mt-1 text-lg font-semibold text-[#171717]">{p.average}</p>
                      <p className="text-[10px] text-[#D4D4D4]">{p.count} assessments</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "education" && (
          <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
            {devProfile.education.length === 0 ? (
              <p className="text-sm text-[#737373]">No education records.</p>
            ) : (
              <div className="space-y-3">
                {devProfile.education.map((e) => (
                  <div key={e._id} className="flex items-center justify-between rounded-lg border border-[#F0F0F0] px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-[#171717] uppercase">{e.stage}</p>
                      <p className="text-xs text-[#737373]">{e.institutionName || "No institution"} {e.startYear ? `(${e.startYear}–${e.endYear || "present"})` : ""}</p>
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
              <StatCard label="Rate" value={`${devProfile.attendanceStats.rate}%`} sub={`${devProfile.attendanceStats.present} present`} inline />
            </div>
            {devProfile.attendance.length === 0 ? (
              <p className="text-sm text-[#737373]">No attendance records.</p>
            ) : (
              <div className="space-y-2">
                {devProfile.attendance.map((a) => (
                  <div key={a._id} className="flex items-center justify-between rounded-lg border border-[#F0F0F0] px-3 py-2">
                    <p className="text-sm text-[#171717]">#{a.sessionNumber} {a.sessionTitle}</p>
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
            {/* Growth data */}
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
                      <div>
                        <p className="text-sm text-[#171717]">{s.templateShortCode}: {s.totalScore}</p>
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
                    <div>
                      <p className="text-sm font-medium text-[#171717]">{r.title}</p>
                      <p className="text-xs text-[#737373]">{r.category} {r.amountRequested ? `· ₦${r.amountRequested.toLocaleString()}` : ""}</p>
                    </div>
                    <span className="rounded-full bg-[#F0F0F0] px-2 py-0.5 text-[10px] text-[#525252]">{r.status.replace(/_/g, " ")}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "timeline" && (
          <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
            {!timeline || timeline.length === 0 ? (
              <p className="text-sm text-[#737373]">No events.</p>
            ) : (
              <div className="space-y-3">
                {timeline.map((e, i) => {
                  const color = EVENT_COLORS[e.type] || { bg: "bg-[#F0F0F0]", text: "text-[#525252]" };
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${color.bg}`}>
                        <span className={`text-[8px] font-bold ${color.text}`}>{e.type[0].toUpperCase()}</span>
                      </div>
                      <div className="min-w-0 flex-1 border-b border-[#F0F0F0] pb-3">
                        <p className="text-sm font-medium text-[#171717]">{e.title}</p>
                        <p className="text-xs text-[#737373]">{e.description}</p>
                        <p className="mt-0.5 text-[10px] text-[#D4D4D4]">{new Date(e.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, inline }: { label: string; value: string; sub: string; inline?: boolean }) {
  if (inline) {
    return (
      <div>
        <span className="text-xs text-[#737373]">{label}: </span>
        <span className="text-sm font-semibold text-[#171717]">{value}</span>
        <span className="text-xs text-[#737373]"> {sub}</span>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#171717]">{value}</p>
      <p className="mt-0.5 text-xs text-[#737373]">{sub}</p>
    </div>
  );
}

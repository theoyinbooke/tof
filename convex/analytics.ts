import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireAdmin, requireAdminOrMentor, requireOwnerOrAdmin } from "./authHelpers";

/** Full development profile: profile + education + attendance + support + assessments + mentorship */
export const getDevelopmentProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found.");

    const profile = await ctx.db
      .query("beneficiaryProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    const education = await ctx.db
      .query("educationRecords")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .take(50);

    const attendance = await ctx.db
      .query("sessionAttendance")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .take(200);

    const supportRequests = await ctx.db
      .query("supportRequests")
      .withIndex("by_beneficiaryUserId", (q) => q.eq("beneficiaryUserId", args.userId))
      .take(100);

    const assessmentScores = await ctx.db
      .query("assessmentScores")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .take(100);

    const enrichedScores = await Promise.all(
      assessmentScores.map(async (s) => {
        const template = await ctx.db.get(s.templateId);
        return { ...s, templateName: template?.name, templateShortCode: template?.shortCode, pillar: template?.pillar };
      }),
    );

    const mentorAssignment = await ctx.db
      .query("mentorAssignments")
      .withIndex("by_beneficiaryUserId_and_isActive", (q) =>
        q.eq("beneficiaryUserId", args.userId).eq("isActive", true),
      )
      .take(1);

    const mentor = mentorAssignment.length > 0 ? await ctx.db.get(mentorAssignment[0].mentorId) : null;

    const notes = await ctx.db
      .query("mentorNotes")
      .withIndex("by_beneficiaryUserId", (q) => q.eq("beneficiaryUserId", args.userId))
      .order("desc")
      .take(50);

    const enrichedAttendance = await Promise.all(
      attendance.map(async (a) => {
        const session = await ctx.db.get(a.sessionId);
        return { ...a, sessionTitle: session?.title, sessionNumber: session?.sessionNumber };
      }),
    );

    // Compute attendance stats
    const presentCount = attendance.filter((a) => a.status === "present").length;
    const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

    return {
      user,
      profile,
      education,
      attendance: enrichedAttendance,
      attendanceStats: { present: presentCount, total: attendance.length, rate: attendanceRate },
      supportRequests,
      assessmentScores: enrichedScores,
      mentor,
      mentorAssignment: mentorAssignment[0] || null,
      notes,
    };
  },
});

/** Instrument-level growth: scores over time for a single user, grouped by template */
export const getGrowthData = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireOwnerOrAdmin(ctx, args.userId);

    const scores = await ctx.db
      .query("assessmentScores")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .take(200);

    const enriched = await Promise.all(
      scores.map(async (s) => {
        const template = await ctx.db.get(s.templateId);
        return {
          templateId: s.templateId,
          shortCode: template?.shortCode || "?",
          name: template?.name || "Unknown",
          pillar: template?.pillar,
          totalScore: s.totalScore,
          severityBand: s.severityBand,
          scoredAt: s.scoredAt,
        };
      }),
    );

    // Group by template
    const grouped: Record<string, typeof enriched> = {};
    for (const entry of enriched) {
      const key = entry.shortCode;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(entry);
    }

    // Sort each group by scoredAt
    for (const key of Object.keys(grouped)) {
      grouped[key].sort((a, b) => a.scoredAt - b.scoredAt);
    }

    return grouped;
  },
});

/** Pillar-level indicators: average scores per pillar for a user */
export const getPillarIndicators = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireOwnerOrAdmin(ctx, args.userId);

    const scores = await ctx.db
      .query("assessmentScores")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .take(200);

    const pillarData: Record<string, { total: number; count: number; scores: number[] }> = {};

    for (const score of scores) {
      const template = await ctx.db.get(score.templateId);
      const pillar = template?.pillar || "unknown";

      if (!pillarData[pillar]) {
        pillarData[pillar] = { total: 0, count: 0, scores: [] };
      }
      pillarData[pillar].total += score.totalScore ?? 0;
      pillarData[pillar].count += 1;
      pillarData[pillar].scores.push(score.totalScore ?? 0);
    }

    const indicators = Object.entries(pillarData).map(([pillar, data]) => ({
      pillar,
      average: Math.round(data.total / data.count),
      count: data.count,
      latest: data.scores[data.scores.length - 1],
    }));

    return indicators;
  },
});

/** Cohort averages: average scores across all active members of a cohort */
export const getCohortAverages = query({
  args: { cohortId: v.id("cohorts") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const memberships = await ctx.db
      .query("cohortMemberships")
      .withIndex("by_cohortId_and_status", (q) =>
        q.eq("cohortId", args.cohortId).eq("status", "active"),
      )
      .take(200);

    const templateAverages: Record<string, { shortCode: string; name: string; total: number; count: number }> = {};

    for (const m of memberships) {
      const scores = await ctx.db
        .query("assessmentScores")
        .withIndex("by_userId", (q) => q.eq("userId", m.userId))
        .take(100);

      for (const score of scores) {
        const key = score.templateId as string;
        if (!templateAverages[key]) {
          const template = await ctx.db.get(score.templateId);
          templateAverages[key] = {
            shortCode: template?.shortCode || "?",
            name: template?.name || "Unknown",
            total: 0,
            count: 0,
          };
        }
        templateAverages[key].total += score.totalScore ?? 0;
        templateAverages[key].count += 1;
      }
    }

    return Object.values(templateAverages).map((t) => ({
      ...t,
      average: Math.round(t.total / t.count),
    }));
  },
});

/** Admin cohort overview: summary stats for all cohorts */
export const getCohortOverview = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const cohorts = await ctx.db.query("cohorts").take(50);

    const overview = await Promise.all(
      cohorts.map(async (c) => {
        const memberships = await ctx.db
          .query("cohortMemberships")
          .withIndex("by_cohortId", (q) => q.eq("cohortId", c._id))
          .take(200);

        const active = memberships.filter((m) => m.status === "active").length;

        const sessions = await ctx.db
          .query("sessions")
          .withIndex("by_cohortId", (q) => q.eq("cohortId", c._id))
          .take(100);

        const totalSessions = sessions.length;
        const nextSession = sessions
          .filter(
            (s) =>
              s.scheduledDate &&
              (s.status === "upcoming" || s.status === "active"),
          )
          .sort((a, b) => (a.scheduledDate || 0) - (b.scheduledDate || 0))[0];

        return {
          ...c,
          totalMembers: memberships.length,
          activeMembers: active,
          totalSessions,
          nextSessionDate: nextSession?.scheduledDate,
          nextSessionTitle: nextSession?.title,
        };
      }),
    );

    return overview;
  },
});

/** Cross-domain event timeline for a beneficiary */
export const getTimeline = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdminOrMentor(ctx);

    const events: Array<{ type: string; title: string; description: string; timestamp: number }> = [];

    // Attendance events
    const attendance = await ctx.db
      .query("sessionAttendance")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .take(100);

    for (const a of attendance) {
      const session = await ctx.db.get(a.sessionId);
      events.push({
        type: "attendance",
        title: `Session ${session?.sessionNumber || "?"}: ${a.status}`,
        description: session?.title || "",
        timestamp: a.markedAt,
      });
    }

    // Support request events
    const supportRequests = await ctx.db
      .query("supportRequests")
      .withIndex("by_beneficiaryUserId", (q) => q.eq("beneficiaryUserId", args.userId))
      .take(50);

    for (const r of supportRequests) {
      events.push({
        type: "support",
        title: `Support: ${r.title}`,
        description: `Status: ${r.status}`,
        timestamp: r.createdAt,
      });
    }

    // Assessment scores
    const scores = await ctx.db
      .query("assessmentScores")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .take(100);

    for (const s of scores) {
      const template = await ctx.db.get(s.templateId);
      events.push({
        type: "assessment",
        title: `Assessment: ${template?.shortCode || "?"}`,
        description: `Score: ${s.totalScore}${s.severityBand ? ` (${s.severityBand})` : ""}`,
        timestamp: s.scoredAt,
      });
    }

    // Education milestones
    const education = await ctx.db
      .query("educationRecords")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .take(50);

    for (const e of education) {
      events.push({
        type: "education",
        title: `Education: ${e.stage.toUpperCase()}`,
        description: e.institutionName || "Record added",
        timestamp: e.createdAt,
      });
    }

    // Sort by timestamp descending
    events.sort((a, b) => b.timestamp - a.timestamp);

    // Deduplicate by type+title+timestamp
    const seen = new Set<string>();
    return events.filter((e) => {
      const key = `${e.type}:${e.title}:${e.timestamp}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  },
});

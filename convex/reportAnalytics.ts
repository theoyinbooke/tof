import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireAdmin } from "./authHelpers";

/** High-level KPIs for the Overview tab */
export const overviewKPIs = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const profiles = await ctx.db.query("beneficiaryProfiles").take(500);
    const totalBeneficiaries = profiles.length;
    const activeBeneficiaries = profiles.filter(
      (p) => p.lifecycleStatus === "active",
    ).length;

    const cohorts = await ctx.db.query("cohorts").take(100);
    const totalCohorts = cohorts.length;
    const activeCohorts = cohorts.filter((c) => c.isActive).length;

    const sessions = await ctx.db.query("sessions").take(500);
    const sessionsDelivered = sessions.filter(
      (s) => s.status === "completed",
    ).length;

    const attendance = await ctx.db.query("sessionAttendance").take(2000);
    const presentCount = attendance.filter((a) => a.status === "present").length;
    const overallAttendanceRate =
      attendance.length > 0
        ? Math.round((presentCount / attendance.length) * 100)
        : 0;

    const disbursements = await ctx.db.query("disbursements").take(1000);
    const totalDisbursed = disbursements.reduce((sum, d) => sum + d.amount, 0);

    const safeguardingOpen = await ctx.db
      .query("safeguardingActions")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .take(200);
    const safeguardingInProgress = await ctx.db
      .query("safeguardingActions")
      .withIndex("by_status", (q) => q.eq("status", "in_progress"))
      .take(200);
    const openSafeguardingActions =
      safeguardingOpen.length + safeguardingInProgress.length;

    const pendingSubmitted = await ctx.db
      .query("supportRequests")
      .withIndex("by_status", (q) => q.eq("status", "submitted"))
      .take(200);
    const pendingReview = await ctx.db
      .query("supportRequests")
      .withIndex("by_status", (q) => q.eq("status", "under_review"))
      .take(200);
    const pendingSupportRequests =
      pendingSubmitted.length + pendingReview.length;

    const completedAssignments = await ctx.db
      .query("assessmentAssignments")
      .withIndex("by_status", (q) => q.eq("status", "completed"))
      .take(1000);
    const assessmentsCompleted = completedAssignments.length;

    return {
      totalBeneficiaries,
      activeBeneficiaries,
      totalCohorts,
      activeCohorts,
      sessionsDelivered,
      overallAttendanceRate,
      totalDisbursed,
      openSafeguardingActions,
      pendingSupportRequests,
      assessmentsCompleted,
    };
  },
});

/** Beneficiary demographics and status breakdown */
export const beneficiaryBreakdown = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const profiles = await ctx.db.query("beneficiaryProfiles").take(500);
    const total = profiles.length;

    // Lifecycle distribution
    const lifecycleMap: Record<string, number> = {};
    for (const p of profiles) {
      lifecycleMap[p.lifecycleStatus] =
        (lifecycleMap[p.lifecycleStatus] || 0) + 1;
    }
    const lifecycleDistribution = Object.entries(lifecycleMap).map(
      ([status, count]) => ({ status, count }),
    );

    // Gender distribution
    const genderMap: Record<string, number> = {};
    for (const p of profiles) {
      const gender = p.gender || "Not specified";
      genderMap[gender] = (genderMap[gender] || 0) + 1;
    }
    const genderDistribution = Object.entries(genderMap).map(
      ([gender, count]) => ({ gender, count }),
    );

    // State of origin distribution (top 10)
    const stateMap: Record<string, number> = {};
    for (const p of profiles) {
      const state = p.stateOfOrigin || "Not specified";
      stateMap[state] = (stateMap[state] || 0) + 1;
    }
    const stateDistribution = Object.entries(stateMap)
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Profile completion buckets
    const buckets = [
      { bucket: "0-25%", min: 0, max: 25, count: 0 },
      { bucket: "26-50%", min: 26, max: 50, count: 0 },
      { bucket: "51-75%", min: 51, max: 75, count: 0 },
      { bucket: "76-100%", min: 76, max: 100, count: 0 },
    ];
    for (const p of profiles) {
      const pct = p.profileCompletionPercent;
      for (const b of buckets) {
        if (pct >= b.min && pct <= b.max) {
          b.count++;
          break;
        }
      }
    }
    const profileCompletionBuckets = buckets.map(({ bucket, count }) => ({
      bucket,
      count,
    }));

    // Retention rate: active / (active + withdrawn)
    const active = lifecycleMap["active"] || 0;
    const withdrawn = lifecycleMap["withdrawn"] || 0;
    const retentionRate =
      active + withdrawn > 0
        ? Math.round((active / (active + withdrawn)) * 100)
        : 100;

    // Average profile completion
    const avgProfileCompletion =
      total > 0
        ? Math.round(
            profiles.reduce((sum, p) => sum + p.profileCompletionPercent, 0) /
              total,
          )
        : 0;

    return {
      total,
      lifecycleDistribution,
      genderDistribution,
      stateDistribution,
      profileCompletionBuckets,
      retentionRate,
      avgProfileCompletion,
    };
  },
});

/** Program delivery metrics: sessions, attendance, pillars */
export const programMetrics = query({
  args: { cohortId: v.optional(v.id("cohorts")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Get sessions, optionally filtered by cohort
    let sessions;
    if (args.cohortId) {
      sessions = await ctx.db
        .query("sessions")
        .withIndex("by_cohortId", (q) => q.eq("cohortId", args.cohortId!))
        .take(500);
    } else {
      sessions = await ctx.db.query("sessions").take(500);
    }

    // Session status breakdown
    const statusMap: Record<string, number> = {};
    for (const s of sessions) {
      statusMap[s.status] = (statusMap[s.status] || 0) + 1;
    }
    const sessionStatusBreakdown = Object.entries(statusMap).map(
      ([status, count]) => ({ status, count }),
    );

    // Pillar coverage
    const pillarMap: Record<
      string,
      { sessionsCount: number; completedCount: number }
    > = {};
    for (const s of sessions) {
      const pillar = s.pillar || "Unassigned";
      if (!pillarMap[pillar]) {
        pillarMap[pillar] = { sessionsCount: 0, completedCount: 0 };
      }
      pillarMap[pillar].sessionsCount++;
      if (s.status === "completed") {
        pillarMap[pillar].completedCount++;
      }
    }
    const pillarCoverage = Object.entries(pillarMap).map(
      ([pillar, data]) => ({ pillar, ...data }),
    );

    // Attendance trend: per completed/active session
    const completedSessions = sessions
      .filter(
        (s) =>
          s.status === "completed" ||
          s.status === "active",
      )
      .sort(
        (a, b) => (a.scheduledDate || 0) - (b.scheduledDate || 0),
      );

    const attendanceTrend = await Promise.all(
      completedSessions.slice(0, 30).map(async (s) => {
        const records = await ctx.db
          .query("sessionAttendance")
          .withIndex("by_sessionId", (q) => q.eq("sessionId", s._id))
          .take(200);

        const presentCount = records.filter(
          (r) => r.status === "present",
        ).length;
        const absentCount = records.filter(
          (r) => r.status === "absent",
        ).length;
        const excusedCount = records.filter(
          (r) => r.status === "excused",
        ).length;
        const total = records.length;

        return {
          sessionNumber: s.sessionNumber,
          title: s.title,
          scheduledDate: s.scheduledDate || 0,
          presentCount,
          absentCount,
          excusedCount,
          rate: total > 0 ? Math.round((presentCount / total) * 100) : 0,
        };
      }),
    );

    // Cohort progress
    const cohorts = await ctx.db.query("cohorts").take(50);
    const cohortProgress = await Promise.all(
      cohorts.map(async (c) => {
        const cohortSessions = await ctx.db
          .query("sessions")
          .withIndex("by_cohortId", (q) => q.eq("cohortId", c._id))
          .take(200);
        const totalSess = cohortSessions.length;
        const completedSess = cohortSessions.filter(
          (s) => s.status === "completed",
        ).length;
        return {
          cohortName: c.name,
          totalSessions: totalSess,
          completedSessions: completedSess,
          progressPercent:
            totalSess > 0 ? Math.round((completedSess / totalSess) * 100) : 0,
        };
      }),
    );

    return {
      sessionStatusBreakdown,
      pillarCoverage,
      attendanceTrend,
      cohortProgress,
    };
  },
});

/** Assessment analytics: scores, severity, trends */
export const assessmentMetrics = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const scores = await ctx.db.query("assessmentScores").take(2000);
    const totalScored = scores.length;

    const flagged = scores.filter(
      (s) =>
        s.flagBehavior === "mentor_notify" ||
        s.flagBehavior === "admin_review",
    );
    const totalFlagged = flagged.length;
    const flagBreakdown = {
      mentorNotify: flagged.filter((f) => f.flagBehavior === "mentor_notify")
        .length,
      adminReview: flagged.filter((f) => f.flagBehavior === "admin_review")
        .length,
    };

    // Group scores by template for severity distribution
    const templateScores: Record<
      string,
      { templateId: string; bands: Record<string, number>; count: number }
    > = {};
    for (const s of scores) {
      const key = s.templateId as string;
      if (!templateScores[key]) {
        templateScores[key] = { templateId: key, bands: {}, count: 0 };
      }
      templateScores[key].count++;
      const band = s.severityBand || "Unscored";
      templateScores[key].bands[band] =
        (templateScores[key].bands[band] || 0) + 1;
    }

    // Enrich with template info
    const severityDistribution = await Promise.all(
      Object.values(templateScores).map(async (ts) => {
        const template = await ctx.db.get(ts.templateId as never);
        const total = ts.count;
        return {
          shortCode: (template as { shortCode?: string })?.shortCode || "?",
          name: (template as { name?: string })?.name || "Unknown",
          bands: Object.entries(ts.bands).map(([band, count]) => ({
            band,
            count,
            pct: total > 0 ? Math.round((count / total) * 100) : 0,
          })),
        };
      }),
    );

    // Score trends: group by template + month
    const trendData: Record<
      string,
      {
        templateId: string;
        months: Record<string, { total: number; count: number }>;
      }
    > = {};
    for (const s of scores) {
      const key = s.templateId as string;
      if (!trendData[key]) {
        trendData[key] = { templateId: key, months: {} };
      }
      const month = new Date(s.scoredAt).toISOString().slice(0, 7);
      if (!trendData[key].months[month]) {
        trendData[key].months[month] = { total: 0, count: 0 };
      }
      trendData[key].months[month].total += s.totalScore ?? 0;
      trendData[key].months[month].count++;
    }

    const scoreTrends = await Promise.all(
      Object.values(trendData).map(async (td) => {
        const template = await ctx.db.get(td.templateId as never);
        const points = Object.entries(td.months)
          .map(([month, data]) => ({
            month,
            avgScore:
              data.count > 0 ? Math.round(data.total / data.count) : 0,
            count: data.count,
          }))
          .sort((a, b) => a.month.localeCompare(b.month));

        return {
          shortCode: (template as { shortCode?: string })?.shortCode || "?",
          name: (template as { name?: string })?.name || "Unknown",
          points,
        };
      }),
    );

    // Safeguarding by status
    const safeguardingActions = await ctx.db
      .query("safeguardingActions")
      .take(500);
    const sgStatusMap: Record<string, number> = {};
    for (const a of safeguardingActions) {
      sgStatusMap[a.status] = (sgStatusMap[a.status] || 0) + 1;
    }
    const safeguardingByStatus = Object.entries(sgStatusMap).map(
      ([status, count]) => ({ status, count }),
    );

    return {
      totalScored,
      totalFlagged,
      flagBreakdown,
      severityDistribution,
      scoreTrends,
      safeguardingByStatus,
    };
  },
});

/** Financial analytics: disbursements, categories, trends */
export const financialMetrics = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const disbursements = await ctx.db.query("disbursements").take(1000);
    const totalDisbursed = disbursements.reduce((sum, d) => sum + d.amount, 0);
    const count = disbursements.length;
    const avgAmount = count > 0 ? Math.round(totalDisbursed / count) : 0;

    // Spending by category — need to look up support requests
    const categoryMap: Record<string, { total: number; count: number }> = {};
    for (const d of disbursements) {
      const request = await ctx.db.get(d.requestId);
      const category = request?.category || "other";
      if (!categoryMap[category]) {
        categoryMap[category] = { total: 0, count: 0 };
      }
      categoryMap[category].total += d.amount;
      categoryMap[category].count++;
    }
    const byCategory = Object.entries(categoryMap).map(
      ([category, data]) => ({ category, ...data }),
    );

    // Monthly spending trend
    const monthlyMap: Record<string, { total: number; count: number }> = {};
    for (const d of disbursements) {
      const date = d.transferDate || d.createdAt;
      const month = new Date(date).toISOString().slice(0, 7);
      if (!monthlyMap[month]) {
        monthlyMap[month] = { total: 0, count: 0 };
      }
      monthlyMap[month].total += d.amount;
      monthlyMap[month].count++;
    }
    const monthlySpending = Object.entries(monthlyMap)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Evidence tracking
    const evidenceTracking = {
      notRequired: disbursements.filter(
        (d) => d.evidenceStatus === "not_required",
      ).length,
      pending: disbursements.filter((d) => d.evidenceStatus === "pending")
        .length,
      submitted: disbursements.filter((d) => d.evidenceStatus === "submitted")
        .length,
      verified: disbursements.filter((d) => d.evidenceStatus === "verified")
        .length,
      overdue: disbursements.filter(
        (d) =>
          d.evidenceStatus === "pending" &&
          d.evidenceDueDate &&
          d.evidenceDueDate < Date.now(),
      ).length,
    };

    // Support request pipeline
    const allRequests = await ctx.db.query("supportRequests").take(1000);
    const pipelineMap: Record<string, number> = {};
    for (const r of allRequests) {
      pipelineMap[r.status] = (pipelineMap[r.status] || 0) + 1;
    }
    const pipelineOrder = [
      "draft",
      "submitted",
      "under_review",
      "approved",
      "declined",
      "disbursed",
      "evidence_requested",
      "evidence_submitted",
      "verified",
      "closed",
    ];
    const requestPipeline = pipelineOrder
      .filter((status) => (pipelineMap[status] || 0) > 0)
      .map((status) => ({
        status,
        count: pipelineMap[status] || 0,
      }));

    return {
      totalDisbursed,
      count,
      avgAmount,
      byCategory,
      monthlySpending,
      evidenceTracking,
      requestPipeline,
    };
  },
});

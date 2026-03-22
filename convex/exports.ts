import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireAdmin } from "./authHelpers";
import { logAuditEvent } from "./auditLogs";

/** Generate individual beneficiary report data (CSV-ready) */
export const exportBeneficiaryReport = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

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

    const scores = await ctx.db
      .query("assessmentScores")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .take(100);

    const enrichedScores = await Promise.all(
      scores.map(async (s) => {
        const template = await ctx.db.get(s.templateId);
        return {
          instrument: template?.shortCode || "?",
          totalScore: s.totalScore,
          severityBand: s.severityBand || "",
          scoredAt: new Date(s.scoredAt).toISOString(),
        };
      }),
    );

    const presentCount = attendance.filter((a) => a.status === "present").length;

    await logAuditEvent(ctx, {
      userId: admin._id,
      action: "export_beneficiary_report",
      resource: "users",
      resourceId: args.userId,
      details: `Exported report for ${user.name}`,
    });

    // Return structured data for CSV generation on client
    return {
      type: "beneficiary_report" as const,
      generatedAt: new Date().toISOString(),
      beneficiary: {
        name: user.name,
        email: user.email,
        role: user.role,
        lifecycleStatus: profile?.lifecycleStatus || "unknown",
        profileCompletion: profile?.profileCompletionPercent || 0,
        firstName: profile?.firstName || "",
        lastName: profile?.lastName || "",
        stateOfOrigin: profile?.stateOfOrigin || "",
      },
      education: education.map((e) => ({
        stage: e.stage,
        institution: e.institutionName || "",
        startYear: e.startYear || "",
        endYear: e.endYear || "",
        isCurrent: e.isCurrent,
      })),
      attendanceSummary: {
        total: attendance.length,
        present: presentCount,
        rate: attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0,
      },
      assessments: enrichedScores,
    };
  },
});

/** Generate cohort report data (CSV-ready) */
export const exportCohortReport = mutation({
  args: { cohortId: v.id("cohorts") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const cohort = await ctx.db.get(args.cohortId);
    if (!cohort) throw new Error("Cohort not found.");

    const memberships = await ctx.db
      .query("cohortMemberships")
      .withIndex("by_cohortId", (q) => q.eq("cohortId", args.cohortId))
      .take(200);

    const members = await Promise.all(
      memberships.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        const profile = await ctx.db
          .query("beneficiaryProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", m.userId))
          .unique();

        const attendance = await ctx.db
          .query("sessionAttendance")
          .withIndex("by_userId", (q) => q.eq("userId", m.userId))
          .take(200);
        const presentCount = attendance.filter((a) => a.status === "present").length;

        const scores = await ctx.db
          .query("assessmentScores")
          .withIndex("by_userId", (q) => q.eq("userId", m.userId))
          .take(100);

        return {
          name: user?.name || "",
          email: user?.email || "",
          membershipStatus: m.status,
          lifecycleStatus: profile?.lifecycleStatus || "unknown",
          profileCompletion: profile?.profileCompletionPercent || 0,
          attendanceRate: attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0,
          assessmentsCompleted: scores.length,
        };
      }),
    );

    await logAuditEvent(ctx, {
      userId: admin._id,
      action: "export_cohort_report",
      resource: "cohorts",
      resourceId: args.cohortId,
      details: `Exported report for cohort "${cohort.name}" with ${members.length} members`,
    });

    return {
      type: "cohort_report" as const,
      generatedAt: new Date().toISOString(),
      cohort: { name: cohort.name, description: cohort.description || "" },
      members,
    };
  },
});

/** Generate financial report data (CSV-ready) — redacts bank references */
export const exportFinancialReport = mutation({
  args: {},
  handler: async (ctx) => {
    const admin = await requireAdmin(ctx);

    const disbursements = await ctx.db.query("disbursements").take(1000);

    const enriched = await Promise.all(
      disbursements.map(async (d) => {
        const request = await ctx.db.get(d.requestId);
        const beneficiary = request ? await ctx.db.get(request.beneficiaryUserId) : null;
        return {
          beneficiaryName: beneficiary?.name || "Unknown",
          category: request?.category || "",
          requestTitle: request?.title || "",
          amount: d.amount,
          // Bank reference is NOT exported — redacted for reports
          transferDate: d.transferDate ? new Date(d.transferDate).toISOString() : "",
          evidenceStatus: d.evidenceStatus,
          createdAt: new Date(d.createdAt).toISOString(),
        };
      }),
    );

    const totalAmount = disbursements.reduce((sum, d) => sum + d.amount, 0);

    await logAuditEvent(ctx, {
      userId: admin._id,
      action: "export_financial_report",
      resource: "disbursements",
      details: `Exported financial report with ${disbursements.length} disbursements, total ₦${totalAmount.toLocaleString()}`,
    });

    return {
      type: "financial_report" as const,
      generatedAt: new Date().toISOString(),
      summary: {
        totalDisbursements: disbursements.length,
        totalAmount,
      },
      disbursements: enriched,
    };
  },
});

/** Transition a beneficiary to alumni status */
export const transitionToAlumni = mutation({
  args: {
    userId: v.id("users"),
    convertToMentor: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const profile = await ctx.db
      .query("beneficiaryProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!profile) throw new Error("Beneficiary profile not found.");

    if (profile.lifecycleStatus === "alumni") {
      throw new Error("Already alumni.");
    }

    // Update profile to alumni
    await ctx.db.patch(profile._id, {
      lifecycleStatus: "alumni",
      updatedAt: Date.now(),
    });

    // Update any active cohort memberships
    const memberships = await ctx.db
      .query("cohortMemberships")
      .withIndex("by_userId_and_status", (q) =>
        q.eq("userId", args.userId).eq("status", "active"),
      )
      .take(10);

    for (const m of memberships) {
      await ctx.db.patch(m._id, { status: "alumni", updatedAt: Date.now() });
    }

    // Optionally convert to mentor role
    if (args.convertToMentor) {
      await ctx.db.patch(args.userId, {
        role: "mentor",
        updatedAt: Date.now(),
      });
    }

    await logAuditEvent(ctx, {
      userId: admin._id,
      action: "alumni_transition",
      resource: "users",
      resourceId: args.userId,
      details: `Transitioned to alumni${args.convertToMentor ? " and converted to mentor role" : ""}`,
    });

    return profile._id;
  },
});

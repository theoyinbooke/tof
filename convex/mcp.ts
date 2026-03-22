import { v } from "convex/values";
import {
  QueryCtx,
  MutationCtx,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { logAuditEvent } from "./auditLogs";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_LIMIT = 50;

type McpCtx = QueryCtx | MutationCtx;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function findUserByEmail(
  ctx: McpCtx,
  email: string,
): Promise<Doc<"users"> | null> {
  return await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", normalizeEmail(email)))
    .first();
}

async function requireActor(ctx: MutationCtx, actorEmail: string) {
  const actor = await findUserByEmail(ctx, actorEmail);
  if (!actor) {
    throw new Error(`No user found for actor email: ${actorEmail}`);
  }
  if (actor.role !== "admin") {
    throw new Error(`Actor ${actorEmail} is not an admin (role: ${actor.role})`);
  }
  if (!actor.isActive) {
    throw new Error(`Actor ${actorEmail} is deactivated`);
  }
  return actor;
}

async function getUserName(ctx: McpCtx, userId: Id<"users">) {
  const user = await ctx.db.get(userId);
  return user?.name ?? "Unknown";
}

// ---------------------------------------------------------------------------
// VALID_TRANSITIONS — mirrored from support.ts
// ---------------------------------------------------------------------------

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ["submitted"],
  submitted: ["under_review", "declined"],
  under_review: ["approved", "declined"],
  approved: ["disbursed"],
  disbursed: ["evidence_requested", "verified", "closed"],
  evidence_requested: ["evidence_submitted"],
  evidence_submitted: ["verified", "evidence_requested"],
  verified: ["closed"],
  declined: [],
  closed: [],
};

// ===========================================================================
// READ QUERIES (12)
// ===========================================================================

// 1. getPlatformDashboard
export const getPlatformDashboard = internalQuery({
  args: {
    activityLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const activityLimit = args.activityLimit ?? 10;

    // User counts by role
    const allUsers = await ctx.db.query("users").collect();
    const userCounts: Record<string, number> = {};
    for (const user of allUsers) {
      userCounts[user.role] = (userCounts[user.role] ?? 0) + 1;
    }
    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter((u) => u.isActive).length;

    // Cohort overview
    const allCohorts = await ctx.db.query("cohorts").collect();
    const cohortOverview = await Promise.all(
      allCohorts.map(async (cohort) => {
        const memberships = await ctx.db
          .query("cohortMemberships")
          .withIndex("by_cohortId", (q) => q.eq("cohortId", cohort._id))
          .collect();
        const sessions = await ctx.db
          .query("sessions")
          .withIndex("by_cohortId", (q) => q.eq("cohortId", cohort._id))
          .collect();
        return {
          id: cohort._id,
          name: cohort.name,
          isActive: cohort.isActive,
          totalMembers: memberships.length,
          activeMembers: memberships.filter((m) => m.status === "active").length,
          totalSessions: sessions.length,
        };
      }),
    );

    // Financial summary
    const allDisbursements = await ctx.db.query("disbursements").collect();
    const totalDisbursed = allDisbursements.reduce((sum, d) => sum + d.amount, 0);
    const pendingEvidence = allDisbursements.filter(
      (d) => d.evidenceStatus === "pending",
    ).length;
    const overdueEvidence = allDisbursements.filter(
      (d) => d.evidenceStatus === "overdue",
    ).length;

    const pendingRequests = await ctx.db
      .query("supportRequests")
      .withIndex("by_status", (q) => q.eq("status", "submitted"))
      .collect();
    const underReview = await ctx.db
      .query("supportRequests")
      .withIndex("by_status", (q) => q.eq("status", "under_review"))
      .collect();

    // Open safeguarding
    const openSafeguarding = await ctx.db
      .query("safeguardingActions")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();
    const inProgressSafeguarding = await ctx.db
      .query("safeguardingActions")
      .withIndex("by_status", (q) => q.eq("status", "in_progress"))
      .collect();

    // Recent audit logs
    const recentLogs = await ctx.db
      .query("auditLogs")
      .order("desc")
      .take(activityLimit);
    const enrichedLogs = await Promise.all(
      recentLogs.map(async (log) => ({
        id: log._id,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId ?? null,
        details: log.details ?? null,
        userName: await getUserName(ctx, log.userId),
        createdAt: log.createdAt,
      })),
    );

    return {
      userCounts,
      totalUsers,
      activeUsers,
      cohortOverview,
      financialSummary: {
        totalDisbursed,
        pendingEvidence,
        overdueEvidence,
        pendingRequests: pendingRequests.length,
        underReview: underReview.length,
      },
      openSafeguardingCount: openSafeguarding.length + inProgressSafeguarding.length,
      recentAuditLogs: enrichedLogs,
    };
  },
});

// 2. listUsers
export const listUsers = internalQuery({
  args: {
    role: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? DEFAULT_LIMIT;

    let users: Doc<"users">[];

    if (args.role && args.isActive !== undefined) {
      users = await ctx.db
        .query("users")
        .withIndex("by_role_and_isActive", (q) =>
          q.eq("role", args.role as Doc<"users">["role"]).eq("isActive", args.isActive!),
        )
        .take(limit);
    } else if (args.role) {
      users = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", args.role as Doc<"users">["role"]))
        .take(limit);
    } else {
      users = await ctx.db.query("users").take(limit);
    }

    return users.map((u) => ({
      id: u._id,
      email: u.email,
      name: u.name,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
    }));
  },
});

// 3. searchBeneficiaries
export const searchBeneficiaries = internalQuery({
  args: {
    search: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const query = args.search.trim().toLowerCase();

    const beneficiaries = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "beneficiary"))
      .collect();

    const matched = beneficiaries
      .filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query),
      )
      .slice(0, limit);

    const enriched = await Promise.all(
      matched.map(async (u) => {
        const profile = await ctx.db
          .query("beneficiaryProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", u._id))
          .first();
        return {
          id: u._id,
          email: u.email,
          name: u.name,
          isActive: u.isActive,
          createdAt: u.createdAt,
          lifecycleStatus: profile?.lifecycleStatus ?? null,
          profileCompletionPercent: profile?.profileCompletionPercent ?? null,
        };
      }),
    );

    return enriched;
  },
});

// 4. getBeneficiaryProfile
export const getBeneficiaryProfile = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Profile
    const profile = await ctx.db
      .query("beneficiaryProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    // Education
    const education = await ctx.db
      .query("educationRecords")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Attendance stats
    const attendance = await ctx.db
      .query("sessionAttendance")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    const attendanceStats = {
      present: attendance.filter((a) => a.status === "present").length,
      absent: attendance.filter((a) => a.status === "absent").length,
      excused: attendance.filter((a) => a.status === "excused").length,
      total: attendance.length,
      rate:
        attendance.length > 0
          ? Math.round(
              (attendance.filter((a) => a.status === "present").length /
                attendance.length) *
                100,
            )
          : 0,
    };

    // Assessment scores
    const scores = await ctx.db
      .query("assessmentScores")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    const enrichedScores = await Promise.all(
      scores.map(async (score) => {
        const template = await ctx.db.get(score.templateId);
        return {
          id: score._id,
          templateName: template?.name ?? "Unknown",
          templateShortCode: template?.shortCode ?? "Unknown",
          totalScore: score.totalScore ?? null,
          subscaleScores: score.subscaleScores ?? null,
          severityBand: score.severityBand ?? null,
          flagBehavior: score.flagBehavior ?? null,
          scoredAt: score.scoredAt,
        };
      }),
    );

    // Mentor
    const mentorAssignment = await ctx.db
      .query("mentorAssignments")
      .withIndex("by_beneficiaryUserId_and_isActive", (q) =>
        q.eq("beneficiaryUserId", args.userId).eq("isActive", true),
      )
      .first();
    let mentor = null;
    if (mentorAssignment) {
      const mentorUser = await ctx.db.get(mentorAssignment.mentorId);
      if (mentorUser) {
        mentor = {
          id: mentorUser._id,
          name: mentorUser.name,
          email: mentorUser.email,
          assignedAt: mentorAssignment.assignedAt,
        };
      }
    }

    // Support requests
    const supportRequests = await ctx.db
      .query("supportRequests")
      .withIndex("by_beneficiaryUserId", (q) =>
        q.eq("beneficiaryUserId", args.userId),
      )
      .collect();

    // Cohort memberships
    const memberships = await ctx.db
      .query("cohortMemberships")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    const enrichedMemberships = await Promise.all(
      memberships.map(async (m) => {
        const cohort = await ctx.db.get(m.cohortId);
        return {
          cohortId: m.cohortId,
          cohortName: cohort?.name ?? "Unknown",
          status: m.status,
          joinedAt: m.joinedAt,
        };
      }),
    );

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      profile: profile
        ? {
            firstName: profile.firstName ?? null,
            lastName: profile.lastName ?? null,
            dateOfBirth: profile.dateOfBirth ?? null,
            gender: profile.gender ?? null,
            phone: profile.phone ?? null,
            address: profile.address ?? null,
            stateOfOrigin: profile.stateOfOrigin ?? null,
            lga: profile.lga ?? null,
            guardianName: profile.guardianName ?? null,
            guardianPhone: profile.guardianPhone ?? null,
            lifecycleStatus: profile.lifecycleStatus,
            profileCompletionPercent: profile.profileCompletionPercent,
            adminNotes: profile.adminNotes ?? null,
          }
        : null,
      education: education.map((e) => ({
        stage: e.stage,
        isCurrent: e.isCurrent,
        institutionName: e.institutionName ?? null,
        startYear: e.startYear ?? null,
        endYear: e.endYear ?? null,
        courseOfStudy: e.courseOfStudy ?? null,
        jambScore: e.jambScore ?? null,
      })),
      attendanceStats,
      assessmentScores: enrichedScores,
      mentor,
      supportRequests: supportRequests.map((r) => ({
        id: r._id,
        title: r.title,
        category: r.category,
        status: r.status,
        amountRequested: r.amountRequested ?? null,
        createdAt: r.createdAt,
      })),
      cohortMemberships: enrichedMemberships,
    };
  },
});

// 5. listCohorts
export const listCohorts = internalQuery({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const cohorts = await ctx.db.query("cohorts").order("desc").take(limit);

    return Promise.all(
      cohorts.map(async (cohort) => {
        const memberships = await ctx.db
          .query("cohortMemberships")
          .withIndex("by_cohortId", (q) => q.eq("cohortId", cohort._id))
          .collect();
        const sessions = await ctx.db
          .query("sessions")
          .withIndex("by_cohortId", (q) => q.eq("cohortId", cohort._id))
          .collect();
        return {
          id: cohort._id,
          name: cohort.name,
          description: cohort.description ?? null,
          startDate: cohort.startDate ?? null,
          endDate: cohort.endDate ?? null,
          isActive: cohort.isActive,
          totalMembers: memberships.length,
          activeMembers: memberships.filter((m) => m.status === "active").length,
          totalSessions: sessions.length,
          createdAt: cohort.createdAt,
        };
      }),
    );
  },
});

// 6. getCohortDetails
export const getCohortDetails = internalQuery({
  args: {
    cohortId: v.id("cohorts"),
  },
  handler: async (ctx, args) => {
    const cohort = await ctx.db.get(args.cohortId);
    if (!cohort) throw new Error("Cohort not found");

    // Members
    const memberships = await ctx.db
      .query("cohortMemberships")
      .withIndex("by_cohortId", (q) => q.eq("cohortId", args.cohortId))
      .collect();
    const members = await Promise.all(
      memberships.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        return {
          userId: m.userId,
          userName: user?.name ?? "Unknown",
          email: user?.email ?? "Unknown",
          status: m.status,
          joinedAt: m.joinedAt,
        };
      }),
    );

    // Sessions
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_cohortId", (q) => q.eq("cohortId", args.cohortId))
      .collect();
    const enrichedSessions = await Promise.all(
      sessions.map(async (s) => {
        const facilitator = s.facilitatorId
          ? await ctx.db.get(s.facilitatorId)
          : null;
        const enrollments = await ctx.db
          .query("sessionEnrollments")
          .withIndex("by_sessionId_and_status", (q) =>
            q.eq("sessionId", s._id).eq("status", "enrolled"),
          )
          .collect();
        return {
          id: s._id,
          sessionNumber: s.sessionNumber,
          title: s.title,
          pillar: s.pillar,
          status: s.status,
          scheduledDate: s.scheduledDate ?? null,
          facilitatorName: facilitator?.name ?? null,
          enrolledCount: enrollments.length,
        };
      }),
    );

    return {
      cohort: {
        id: cohort._id,
        name: cohort.name,
        description: cohort.description ?? null,
        startDate: cohort.startDate ?? null,
        endDate: cohort.endDate ?? null,
        isActive: cohort.isActive,
        createdAt: cohort.createdAt,
      },
      members,
      sessions: enrichedSessions,
    };
  },
});

// 7. listSessions
export const listSessions = internalQuery({
  args: {
    status: v.optional(v.string()),
    cohortId: v.optional(v.id("cohorts")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? DEFAULT_LIMIT;

    let sessions: Doc<"sessions">[];
    if (args.status) {
      sessions = await ctx.db
        .query("sessions")
        .withIndex("by_status", (q) =>
          q.eq("status", args.status as Doc<"sessions">["status"]),
        )
        .take(limit);
    } else if (args.cohortId) {
      sessions = await ctx.db
        .query("sessions")
        .withIndex("by_cohortId", (q) => q.eq("cohortId", args.cohortId!))
        .take(limit);
    } else {
      sessions = await ctx.db.query("sessions").order("desc").take(limit);
    }

    return Promise.all(
      sessions.map(async (s) => {
        const facilitator = s.facilitatorId
          ? await ctx.db.get(s.facilitatorId)
          : null;
        const cohort = s.cohortId ? await ctx.db.get(s.cohortId) : null;
        const enrollments = await ctx.db
          .query("sessionEnrollments")
          .withIndex("by_sessionId_and_status", (q) =>
            q.eq("sessionId", s._id).eq("status", "enrolled"),
          )
          .collect();
        return {
          id: s._id,
          sessionNumber: s.sessionNumber,
          title: s.title,
          pillar: s.pillar,
          status: s.status,
          scheduledDate: s.scheduledDate ?? null,
          facilitatorName: facilitator?.name ?? null,
          cohortName: cohort?.name ?? null,
          enrolledCount: enrollments.length,
          createdAt: s.createdAt,
        };
      }),
    );
  },
});

// 8. listSupportRequests
export const listSupportRequests = internalQuery({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? DEFAULT_LIMIT;

    let requests: Doc<"supportRequests">[];
    if (args.status) {
      requests = await ctx.db
        .query("supportRequests")
        .withIndex("by_status", (q) =>
          q.eq("status", args.status as Doc<"supportRequests">["status"]),
        )
        .order("desc")
        .take(limit);
    } else {
      requests = await ctx.db
        .query("supportRequests")
        .order("desc")
        .take(limit);
    }

    return Promise.all(
      requests.map(async (r) => {
        const beneficiary = await ctx.db.get(r.beneficiaryUserId);
        return {
          id: r._id,
          title: r.title,
          description: r.description,
          category: r.category,
          status: r.status,
          amountRequested: r.amountRequested ?? null,
          beneficiaryName: beneficiary?.name ?? "Unknown",
          beneficiaryEmail: beneficiary?.email ?? "Unknown",
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        };
      }),
    );
  },
});

// 9. getFinancialSummary
export const getFinancialSummary = internalQuery({
  args: {},
  handler: async (ctx) => {
    const allDisbursements = await ctx.db.query("disbursements").collect();
    const totalDisbursed = allDisbursements.reduce((sum, d) => sum + d.amount, 0);
    const disbursementCount = allDisbursements.length;

    const evidenceCounts: Record<string, number> = {};
    for (const d of allDisbursements) {
      evidenceCounts[d.evidenceStatus] =
        (evidenceCounts[d.evidenceStatus] ?? 0) + 1;
    }

    const pendingRequests = await ctx.db
      .query("supportRequests")
      .withIndex("by_status", (q) => q.eq("status", "submitted"))
      .collect();
    const underReview = await ctx.db
      .query("supportRequests")
      .withIndex("by_status", (q) => q.eq("status", "under_review"))
      .collect();
    const approved = await ctx.db
      .query("supportRequests")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();

    return {
      totalDisbursed,
      disbursementCount,
      pendingEvidence: evidenceCounts["pending"] ?? 0,
      overdueEvidence: evidenceCounts["overdue"] ?? 0,
      verifiedEvidence: evidenceCounts["verified"] ?? 0,
      pendingRequests: pendingRequests.length,
      underReview: underReview.length,
      approvedAwaitingDisbursement: approved.length,
    };
  },
});

// 10. listFlaggedAssessments
export const listFlaggedAssessments = internalQuery({
  args: {
    flagFilter: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? DEFAULT_LIMIT;

    let scores: Doc<"assessmentScores">[];
    if (args.flagFilter) {
      scores = await ctx.db
        .query("assessmentScores")
        .withIndex("by_flagBehavior", (q) =>
          q.eq(
            "flagBehavior",
            args.flagFilter as Doc<"assessmentScores">["flagBehavior"],
          ),
        )
        .order("desc")
        .take(limit);
    } else {
      // Get both mentor_notify and admin_review
      const mentorFlags = await ctx.db
        .query("assessmentScores")
        .withIndex("by_flagBehavior", (q) => q.eq("flagBehavior", "mentor_notify"))
        .order("desc")
        .take(limit);
      const adminFlags = await ctx.db
        .query("assessmentScores")
        .withIndex("by_flagBehavior", (q) => q.eq("flagBehavior", "admin_review"))
        .order("desc")
        .take(limit);
      scores = [...mentorFlags, ...adminFlags]
        .sort((a, b) => b.scoredAt - a.scoredAt)
        .slice(0, limit);
    }

    return Promise.all(
      scores.map(async (score) => {
        const user = await ctx.db.get(score.userId);
        const template = await ctx.db.get(score.templateId);
        const safeguarding = await ctx.db
          .query("safeguardingActions")
          .withIndex("by_scoreId", (q) => q.eq("scoreId", score._id))
          .first();
        return {
          id: score._id,
          userId: score.userId,
          userName: user?.name ?? "Unknown",
          templateName: template?.name ?? "Unknown",
          templateShortCode: template?.shortCode ?? "Unknown",
          totalScore: score.totalScore ?? null,
          subscaleScores: score.subscaleScores ?? null,
          severityBand: score.severityBand ?? null,
          flagBehavior: score.flagBehavior ?? null,
          scoredAt: score.scoredAt,
          safeguardingStatus: safeguarding?.status ?? null,
        };
      }),
    );
  },
});

// 11. listSafeguardingActions
export const listSafeguardingActions = internalQuery({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? DEFAULT_LIMIT;

    let actions: Doc<"safeguardingActions">[];
    if (args.status) {
      actions = await ctx.db
        .query("safeguardingActions")
        .withIndex("by_status", (q) =>
          q.eq("status", args.status as Doc<"safeguardingActions">["status"]),
        )
        .order("desc")
        .take(limit);
    } else {
      actions = await ctx.db
        .query("safeguardingActions")
        .order("desc")
        .take(limit);
    }

    return Promise.all(
      actions.map(async (action) => {
        const user = await ctx.db.get(action.userId);
        const score = await ctx.db.get(action.scoreId);
        const template = score ? await ctx.db.get(score.templateId) : null;
        const assignee = action.assignedTo
          ? await ctx.db.get(action.assignedTo)
          : null;
        return {
          id: action._id,
          userId: action.userId,
          userName: user?.name ?? "Unknown",
          flagBehavior: action.flagBehavior,
          status: action.status,
          templateName: template?.name ?? "Unknown",
          totalScore: score?.totalScore ?? null,
          severityBand: score?.severityBand ?? null,
          assigneeName: assignee?.name ?? null,
          recommendedAction: action.recommendedAction ?? null,
          resolutionNote: action.resolutionNote ?? null,
          createdAt: action.createdAt,
          updatedAt: action.updatedAt,
        };
      }),
    );
  },
});

// 12. listAuditLogs
export const listAuditLogs = internalQuery({
  args: {
    action: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? DEFAULT_LIMIT;

    let logs: Doc<"auditLogs">[];
    if (args.action) {
      logs = await ctx.db
        .query("auditLogs")
        .withIndex("by_action", (q) => q.eq("action", args.action!))
        .order("desc")
        .take(limit);
    } else {
      logs = await ctx.db.query("auditLogs").order("desc").take(limit);
    }

    return Promise.all(
      logs.map(async (log) => ({
        id: log._id,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId ?? null,
        details: log.details ?? null,
        userName: await getUserName(ctx, log.userId),
        createdAt: log.createdAt,
      })),
    );
  },
});

// ===========================================================================
// WRITE MUTATIONS (13)
// ===========================================================================

// 13. updateUserRole
export const updateUserRole = internalMutation({
  args: {
    actorEmail: v.string(),
    userId: v.id("users"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = await requireActor(ctx, args.actorEmail);
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const oldRole = user.role;
    await ctx.db.patch(args.userId, {
      role: args.role as Doc<"users">["role"],
      updatedAt: Date.now(),
    });

    await logAuditEvent(ctx, {
      userId: actor._id,
      action: "update_user_role",
      resource: "users",
      resourceId: args.userId,
      details: `Changed role from ${oldRole} to ${args.role} for ${user.name}`,
    });

    return { userId: args.userId, oldRole, newRole: args.role };
  },
});

// 14. toggleUserActive
export const toggleUserActive = internalMutation({
  args: {
    actorEmail: v.string(),
    userId: v.id("users"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const actor = await requireActor(ctx, args.actorEmail);
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(args.userId, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });

    await logAuditEvent(ctx, {
      userId: actor._id,
      action: args.isActive ? "activate_user" : "deactivate_user",
      resource: "users",
      resourceId: args.userId,
      details: `${args.isActive ? "Activated" : "Deactivated"} user ${user.name}`,
    });

    return { userId: args.userId, isActive: args.isActive };
  },
});

// 15. createCohort
export const createCohort = internalMutation({
  args: {
    actorEmail: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const actor = await requireActor(ctx, args.actorEmail);

    const now = Date.now();
    const cohortId = await ctx.db.insert("cohorts", {
      name: args.name,
      description: args.description,
      startDate: args.startDate,
      endDate: args.endDate,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    await logAuditEvent(ctx, {
      userId: actor._id,
      action: "create_cohort",
      resource: "cohorts",
      resourceId: cohortId,
      details: `Created cohort "${args.name}"`,
    });

    return { cohortId };
  },
});

// 16. updateCohort
export const updateCohort = internalMutation({
  args: {
    actorEmail: v.string(),
    cohortId: v.id("cohorts"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const actor = await requireActor(ctx, args.actorEmail);
    const cohort = await ctx.db.get(args.cohortId);
    if (!cohort) throw new Error("Cohort not found");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) patch.name = args.name;
    if (args.description !== undefined) patch.description = args.description;
    if (args.startDate !== undefined) patch.startDate = args.startDate;
    if (args.endDate !== undefined) patch.endDate = args.endDate;
    if (args.isActive !== undefined) patch.isActive = args.isActive;

    await ctx.db.patch(args.cohortId, patch);

    await logAuditEvent(ctx, {
      userId: actor._id,
      action: "update_cohort",
      resource: "cohorts",
      resourceId: args.cohortId,
      details: `Updated cohort "${cohort.name}"`,
    });

    return { cohortId: args.cohortId };
  },
});

// 17. addCohortMember
export const addCohortMember = internalMutation({
  args: {
    actorEmail: v.string(),
    cohortId: v.id("cohorts"),
    userId: v.id("users"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await requireActor(ctx, args.actorEmail);

    const cohort = await ctx.db.get(args.cohortId);
    if (!cohort) throw new Error("Cohort not found");

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Check duplicate
    const existing = await ctx.db
      .query("cohortMemberships")
      .withIndex("by_cohortId", (q) => q.eq("cohortId", args.cohortId))
      .collect();
    const duplicate = existing.find((m) => m.userId === args.userId);
    if (duplicate) {
      throw new Error(
        `User ${user.name} is already a member of cohort "${cohort.name}" (status: ${duplicate.status})`,
      );
    }

    const now = Date.now();
    const membershipId = await ctx.db.insert("cohortMemberships", {
      cohortId: args.cohortId,
      userId: args.userId,
      status: (args.status as Doc<"cohortMemberships">["status"]) ?? "active",
      joinedAt: now,
      updatedAt: now,
    });

    await logAuditEvent(ctx, {
      userId: actor._id,
      action: "add_cohort_member",
      resource: "cohortMemberships",
      resourceId: membershipId,
      details: `Added ${user.name} to cohort "${cohort.name}"`,
    });

    return { membershipId };
  },
});

// 18. createSession
export const createSession = internalMutation({
  args: {
    actorEmail: v.string(),
    sessionNumber: v.number(),
    title: v.string(),
    pillar: v.string(),
    description: v.optional(v.string()),
    scheduledDate: v.optional(v.number()),
    facilitatorId: v.optional(v.id("users")),
    cohortId: v.optional(v.id("cohorts")),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await requireActor(ctx, args.actorEmail);

    const now = Date.now();
    const sessionId = await ctx.db.insert("sessions", {
      sessionNumber: args.sessionNumber,
      title: args.title,
      pillar: args.pillar,
      description: args.description,
      scheduledDate: args.scheduledDate,
      facilitatorId: args.facilitatorId,
      cohortId: args.cohortId,
      status: (args.status as Doc<"sessions">["status"]) ?? "draft",
      createdAt: now,
      updatedAt: now,
    });

    await logAuditEvent(ctx, {
      userId: actor._id,
      action: "create_session",
      resource: "sessions",
      resourceId: sessionId,
      details: `Created session #${args.sessionNumber}: "${args.title}"`,
    });

    return { sessionId };
  },
});

// 19. updateSession
export const updateSession = internalMutation({
  args: {
    actorEmail: v.string(),
    sessionId: v.id("sessions"),
    title: v.optional(v.string()),
    pillar: v.optional(v.string()),
    description: v.optional(v.string()),
    scheduledDate: v.optional(v.number()),
    facilitatorId: v.optional(v.id("users")),
    cohortId: v.optional(v.id("cohorts")),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await requireActor(ctx, args.actorEmail);

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) patch.title = args.title;
    if (args.pillar !== undefined) patch.pillar = args.pillar;
    if (args.description !== undefined) patch.description = args.description;
    if (args.scheduledDate !== undefined) patch.scheduledDate = args.scheduledDate;
    if (args.facilitatorId !== undefined) patch.facilitatorId = args.facilitatorId;
    if (args.cohortId !== undefined) patch.cohortId = args.cohortId;
    if (args.status !== undefined) patch.status = args.status;

    await ctx.db.patch(args.sessionId, patch);

    await logAuditEvent(ctx, {
      userId: actor._id,
      action: "update_session",
      resource: "sessions",
      resourceId: args.sessionId,
      details: `Updated session #${session.sessionNumber}: "${session.title}"`,
    });

    return { sessionId: args.sessionId };
  },
});

// 20. enrollCohortInSession
export const enrollCohortInSession = internalMutation({
  args: {
    actorEmail: v.string(),
    sessionId: v.id("sessions"),
    cohortId: v.id("cohorts"),
  },
  handler: async (ctx, args) => {
    const actor = await requireActor(ctx, args.actorEmail);

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    const cohort = await ctx.db.get(args.cohortId);
    if (!cohort) throw new Error("Cohort not found");

    // Get active members
    const activeMembers = await ctx.db
      .query("cohortMemberships")
      .withIndex("by_cohortId_and_status", (q) =>
        q.eq("cohortId", args.cohortId).eq("status", "active"),
      )
      .collect();

    // Get existing enrollments
    const existingEnrollments = await ctx.db
      .query("sessionEnrollments")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();
    const enrolledUserIds = new Set(existingEnrollments.map((e) => e.userId));

    let enrolledCount = 0;
    const now = Date.now();
    for (const member of activeMembers) {
      if (!enrolledUserIds.has(member.userId)) {
        await ctx.db.insert("sessionEnrollments", {
          sessionId: args.sessionId,
          userId: member.userId,
          enrolledAt: now,
          status: "enrolled",
        });
        enrolledCount++;
      }
    }

    await logAuditEvent(ctx, {
      userId: actor._id,
      action: "enroll_cohort_in_session",
      resource: "sessionEnrollments",
      details: `Enrolled ${enrolledCount} members from "${cohort.name}" into session #${session.sessionNumber}`,
    });

    return { enrolledCount, totalActiveMembers: activeMembers.length };
  },
});

// 21. assignAssessment
export const assignAssessment = internalMutation({
  args: {
    actorEmail: v.string(),
    templateId: v.id("assessmentTemplates"),
    userId: v.optional(v.id("users")),
    sessionId: v.optional(v.id("sessions")),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const actor = await requireActor(ctx, args.actorEmail);

    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Assessment template not found");
    if (template.status !== "published") {
      throw new Error("Template must be published before assigning");
    }

    const now = Date.now();
    let assignedCount = 0;

    if (args.userId) {
      // Single assignment
      const user = await ctx.db.get(args.userId);
      if (!user) throw new Error("User not found");

      await ctx.db.insert("assessmentAssignments", {
        templateId: args.templateId,
        userId: args.userId,
        sessionId: args.sessionId,
        assignedBy: actor._id,
        dueDate: args.dueDate,
        status: "assigned",
        createdAt: now,
        updatedAt: now,
      });
      assignedCount = 1;
    } else if (args.sessionId) {
      // Bulk assign to session enrollees
      const enrollments = await ctx.db
        .query("sessionEnrollments")
        .withIndex("by_sessionId_and_status", (q) =>
          q.eq("sessionId", args.sessionId!).eq("status", "enrolled"),
        )
        .collect();

      for (const enrollment of enrollments) {
        await ctx.db.insert("assessmentAssignments", {
          templateId: args.templateId,
          userId: enrollment.userId,
          sessionId: args.sessionId,
          assignedBy: actor._id,
          dueDate: args.dueDate,
          status: "assigned",
          createdAt: now,
          updatedAt: now,
        });
        assignedCount++;
      }
    } else {
      throw new Error("Must provide either userId or sessionId");
    }

    await logAuditEvent(ctx, {
      userId: actor._id,
      action: "assign_assessment",
      resource: "assessmentAssignments",
      details: `Assigned "${template.name}" (${template.shortCode}) to ${assignedCount} user(s)`,
    });

    return { assignedCount, templateName: template.name };
  },
});

// 22. transitionSupportRequest
export const transitionSupportRequest = internalMutation({
  args: {
    actorEmail: v.string(),
    requestId: v.id("supportRequests"),
    toStatus: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await requireActor(ctx, args.actorEmail);

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Support request not found");

    const allowed = VALID_TRANSITIONS[request.status] || [];
    if (!allowed.includes(args.toStatus)) {
      throw new Error(
        `Invalid transition from "${request.status}" to "${args.toStatus}". Allowed: ${allowed.join(", ") || "none"}.`,
      );
    }

    // Record event
    await ctx.db.insert("supportRequestEvents", {
      requestId: args.requestId,
      action: `${request.status} → ${args.toStatus}`,
      fromStatus: request.status,
      toStatus: args.toStatus,
      performedBy: actor._id,
      note: args.note,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.requestId, {
      status: args.toStatus as Doc<"supportRequests">["status"],
      updatedAt: Date.now(),
    });

    await logAuditEvent(ctx, {
      userId: actor._id,
      action: "transition_support_request",
      resource: "supportRequests",
      resourceId: args.requestId,
      details: `Transitioned "${request.title}" from ${request.status} to ${args.toStatus}`,
    });

    return {
      requestId: args.requestId,
      fromStatus: request.status,
      toStatus: args.toStatus,
    };
  },
});

// 23. assignMentor
export const assignMentor = internalMutation({
  args: {
    actorEmail: v.string(),
    mentorId: v.id("users"),
    beneficiaryUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const actor = await requireActor(ctx, args.actorEmail);

    const mentor = await ctx.db.get(args.mentorId);
    if (!mentor) throw new Error("Mentor not found");
    if (mentor.role !== "mentor" && mentor.role !== "admin") {
      throw new Error(`User ${mentor.name} is not a mentor (role: ${mentor.role})`);
    }

    const beneficiary = await ctx.db.get(args.beneficiaryUserId);
    if (!beneficiary) throw new Error("Beneficiary not found");

    // Deactivate existing active assignment
    const existing = await ctx.db
      .query("mentorAssignments")
      .withIndex("by_beneficiaryUserId_and_isActive", (q) =>
        q.eq("beneficiaryUserId", args.beneficiaryUserId).eq("isActive", true),
      )
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        isActive: false,
        endedAt: Date.now(),
      });
    }

    const now = Date.now();
    const assignmentId = await ctx.db.insert("mentorAssignments", {
      mentorId: args.mentorId,
      beneficiaryUserId: args.beneficiaryUserId,
      isActive: true,
      assignedAt: now,
    });

    await logAuditEvent(ctx, {
      userId: actor._id,
      action: "assign_mentor",
      resource: "mentorAssignments",
      resourceId: assignmentId,
      details: `Assigned mentor ${mentor.name} to beneficiary ${beneficiary.name}`,
    });

    return { assignmentId };
  },
});

// 24. resolveSafeguardingAction
export const resolveSafeguardingAction = internalMutation({
  args: {
    actorEmail: v.string(),
    actionId: v.id("safeguardingActions"),
    status: v.optional(v.string()),
    recommendedAction: v.optional(v.string()),
    resolutionNote: v.optional(v.string()),
    assignedTo: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const actor = await requireActor(ctx, args.actorEmail);

    const action = await ctx.db.get(args.actionId);
    if (!action) throw new Error("Safeguarding action not found");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.status !== undefined) {
      patch.status = args.status;
      if (args.status === "resolved" || args.status === "dismissed") {
        patch.resolvedBy = actor._id;
        patch.resolvedAt = Date.now();
      }
    }
    if (args.recommendedAction !== undefined)
      patch.recommendedAction = args.recommendedAction;
    if (args.resolutionNote !== undefined)
      patch.resolutionNote = args.resolutionNote;
    if (args.assignedTo !== undefined) patch.assignedTo = args.assignedTo;

    await ctx.db.patch(args.actionId, patch);

    await logAuditEvent(ctx, {
      userId: actor._id,
      action: "resolve_safeguarding",
      resource: "safeguardingActions",
      resourceId: args.actionId,
      details: `Updated safeguarding action to ${args.status ?? "updated"}`,
    });

    return { actionId: args.actionId };
  },
});

// 25. createDisbursement
export const createDisbursement = internalMutation({
  args: {
    actorEmail: v.string(),
    requestId: v.id("supportRequests"),
    amount: v.number(),
    bankReference: v.optional(v.string()),
    transferDate: v.optional(v.number()),
    evidenceDueDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await requireActor(ctx, args.actorEmail);

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Support request not found");
    if (request.status !== "approved") {
      throw new Error(
        `Support request must be "approved" to disburse (current: "${request.status}")`,
      );
    }

    const now = Date.now();
    const disbursementId = await ctx.db.insert("disbursements", {
      requestId: args.requestId,
      amount: args.amount,
      bankReference: args.bankReference,
      transferDate: args.transferDate,
      disbursedBy: actor._id,
      evidenceDueDate: args.evidenceDueDate,
      evidenceStatus: args.evidenceDueDate ? "pending" : "not_required",
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });

    // Transition request to disbursed
    await ctx.db.insert("supportRequestEvents", {
      requestId: args.requestId,
      action: `${request.status} → disbursed`,
      fromStatus: request.status,
      toStatus: "disbursed",
      performedBy: actor._id,
      note: args.notes,
      createdAt: now,
    });
    await ctx.db.patch(args.requestId, {
      status: "disbursed",
      updatedAt: now,
    });

    await logAuditEvent(ctx, {
      userId: actor._id,
      action: "create_disbursement",
      resource: "disbursements",
      resourceId: disbursementId,
      details: `Disbursed ${args.amount} for request "${request.title}"`,
    });

    return { disbursementId };
  },
});

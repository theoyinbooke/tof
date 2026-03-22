import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireAdminOrFacilitator, requireUser } from "./authHelpers";
import { notifyWithEmail, formatDate } from "./emailHelpers";

const statusValidator = v.union(
  v.literal("draft"),
  v.literal("upcoming"),
  v.literal("active"),
  v.literal("completed"),
  v.literal("cancelled"),
);

export const list = query({
  args: { status: v.optional(statusValidator) },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    let sessions;
    if (args.status) {
      sessions = await ctx.db.query("sessions").withIndex("by_status", (q) => q.eq("status", args.status!)).take(200);
    } else {
      sessions = await ctx.db.query("sessions").take(200);
    }

    // Enrich with facilitator and cohort names
    const enriched = await Promise.all(
      sessions.map(async (session) => {
        let facilitatorName: string | null = null;
        if (session.facilitatorId) {
          const f = await ctx.db.get(session.facilitatorId);
          if (f) facilitatorName = f.name;
        }
        let cohortName: string | null = null;
        if (session.cohortId) {
          const c = await ctx.db.get(session.cohortId);
          if (c) cohortName = c.name;
        }
        return { ...session, facilitatorName, cohortName };
      }),
    );

    return enriched;
  },
});

export const getById = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session) return null;

    // Enrich with facilitator name
    let facilitator: { _id: string; name: string; email: string } | null = null;
    if (session.facilitatorId) {
      const f = await ctx.db.get(session.facilitatorId);
      if (f) facilitator = { _id: f._id, name: f.name, email: f.email };
    }

    // Enrich with cohort name
    let cohort: { _id: string; name: string } | null = null;
    if (session.cohortId) {
      const c = await ctx.db.get(session.cohortId);
      if (c) cohort = { _id: c._id, name: c.name };
    }

    return { ...session, facilitator, cohort };
  },
});

export const create = mutation({
  args: {
    sessionNumber: v.number(),
    title: v.string(),
    pillar: v.string(),
    description: v.optional(v.string()),
    scheduledDate: v.optional(v.number()),
    facilitatorId: v.optional(v.id("users")),
    cohortId: v.optional(v.id("cohorts")),
    status: v.optional(statusValidator),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("sessions", {
      ...args,
      status: args.status || "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    sessionId: v.id("sessions"),
    title: v.optional(v.string()),
    pillar: v.optional(v.string()),
    description: v.optional(v.string()),
    scheduledDate: v.optional(v.number()),
    facilitatorId: v.optional(v.id("users")),
    cohortId: v.optional(v.id("cohorts")),
    status: v.optional(statusValidator),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { sessionId, ...updates } = args;
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Session not found.");
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) patch[key] = val;
    }
    await ctx.db.patch(sessionId, patch);

    // If session is being cancelled, notify enrolled beneficiaries
    if (args.status === "cancelled" && session.status !== "cancelled") {
      const enrollments = await ctx.db
        .query("sessionEnrollments")
        .withIndex("by_sessionId_and_status", (q) =>
          q.eq("sessionId", sessionId).eq("status", "enrolled"),
        )
        .take(200);

      for (const enrollment of enrollments) {
        await notifyWithEmail(ctx, {
          userId: enrollment.userId,
          type: "session_cancelled",
          title: `Session cancelled: ${session.title}`,
          body: `The session "${session.title}" has been cancelled.`,
          eventKey: `session_cancelled:${sessionId}:${enrollment.userId}`,
          linkUrl: "/beneficiary/sessions",
          emailType: "session-cancelled",
          templateData: { sessionTitle: session.title },
        });
      }
    }

    // If session is being published (draft → upcoming), notify cohort members
    if (
      args.status === "upcoming" &&
      session.status === "draft" &&
      session.cohortId
    ) {
      const members = await ctx.db
        .query("cohortMemberships")
        .withIndex("by_cohortId_and_status", (q) =>
          q.eq("cohortId", session.cohortId!).eq("status", "active"),
        )
        .take(200);

      for (const member of members) {
        await notifyWithEmail(ctx, {
          userId: member.userId,
          type: "session_scheduled",
          title: `New session: ${session.title}`,
          body: `A new session "${session.title}" has been scheduled.`,
          eventKey: `session_scheduled:${sessionId}:${member.userId}`,
          linkUrl: "/beneficiary/sessions",
          emailType: "session-scheduled",
          templateData: {
            sessionTitle: args.title || session.title,
            sessionDate: (args.scheduledDate || session.scheduledDate)
              ? formatDate(args.scheduledDate || session.scheduledDate!)
              : "TBD",
            sessionPillar: args.pillar || session.pillar,
          },
        });
      }
    }

    return sessionId;
  },
});

export const listByCohort = query({
  args: { cohortId: v.id("cohorts") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    if (user.role !== "admin" && user.role !== "facilitator")
      throw new Error("Unauthorized");

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_cohortId", (q) => q.eq("cohortId", args.cohortId))
      .take(100);

    // Enrich each session with facilitator name and enrollment count
    const enriched = await Promise.all(
      sessions.map(async (session) => {
        let facilitatorName: string | undefined;
        if (session.facilitatorId) {
          const fac = await ctx.db.get(session.facilitatorId);
          facilitatorName = fac?.name;
        }

        // Count enrollments
        const enrollments = await ctx.db
          .query("sessionEnrollments")
          .withIndex("by_sessionId_and_status", (q) =>
            q.eq("sessionId", session._id).eq("status", "enrolled"),
          )
          .take(500);

        // Count attendance
        const attendance = await ctx.db
          .query("sessionAttendance")
          .withIndex("by_sessionId", (q) => q.eq("sessionId", session._id))
          .take(500);

        const presentCount = attendance.filter(
          (a) => a.status === "present",
        ).length;

        return {
          ...session,
          facilitatorName,
          enrolledCount: enrollments.length,
          attendedCount: presentCount,
          attendanceRate:
            enrollments.length > 0
              ? Math.round((presentCount / enrollments.length) * 100)
              : 0,
        };
      }),
    );

    return enriched.sort((a, b) => a.sessionNumber - b.sessionNumber);
  },
});

export const listByFacilitator = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAdminOrFacilitator(ctx);
    if (user.role === "admin") {
      return await ctx.db.query("sessions").take(200);
    }
    return await ctx.db.query("sessions").withIndex("by_facilitatorId", (q) => q.eq("facilitatorId", user._id)).take(200);
  },
});

export const listByBeneficiary = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const enrollments = await ctx.db.query("sessionEnrollments").withIndex("by_userId", (q) => q.eq("userId", user._id)).take(200);
    const sessions = await Promise.all(
      enrollments
        .filter((e) => e.status === "enrolled")
        .map(async (e) => {
          const session = await ctx.db.get(e.sessionId);
          if (!session) return null;

          let facilitatorName: string | null = null;
          if (session.facilitatorId) {
            const f = await ctx.db.get(session.facilitatorId);
            if (f) facilitatorName = f.name;
          }

          // Check if there's an assessment assignment for this session + user
          const assignments = await ctx.db
            .query("assessmentAssignments")
            .withIndex("by_userId_and_status", (q) => q.eq("userId", user._id))
            .take(100);
          const sessionAssignment = assignments.find(
            (a) => a.sessionId === session._id && (a.status === "assigned" || a.status === "in_progress"),
          );

          return {
            ...session,
            enrollment: e,
            facilitatorName,
            assessmentAssignmentId: sessionAssignment?._id || null,
          };
        }),
    );
    return sessions.filter(Boolean);
  },
});

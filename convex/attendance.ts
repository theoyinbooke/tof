import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdminOrFacilitator, requireUser } from "./authHelpers";

export const markAttendance = mutation({
  args: {
    sessionId: v.id("sessions"),
    userId: v.id("users"),
    status: v.union(v.literal("present"), v.literal("absent"), v.literal("excused")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const caller = await requireAdminOrFacilitator(ctx);

    // Verify facilitator is assigned (unless admin)
    if (caller.role === "facilitator") {
      const session = await ctx.db.get(args.sessionId);
      if (!session || session.facilitatorId !== caller._id) {
        throw new Error("You are not assigned to this session.");
      }
    }

    // Verify user is enrolled
    const enrollments = await ctx.db
      .query("sessionEnrollments")
      .withIndex("by_sessionId_and_status", (q) =>
        q.eq("sessionId", args.sessionId).eq("status", "enrolled"),
      )
      .take(200);
    const isEnrolled = enrollments.some((e) => e.userId === args.userId);
    if (!isEnrolled) {
      throw new Error("User is not enrolled in this session.");
    }

    // Check for existing attendance record
    const existing = await ctx.db
      .query("sessionAttendance")
      .withIndex("by_sessionId_and_userId", (q) =>
        q.eq("sessionId", args.sessionId).eq("userId", args.userId),
      )
      .take(1);

    if (existing.length > 0) {
      await ctx.db.patch(existing[0]._id, {
        status: args.status,
        notes: args.notes,
        markedBy: caller._id,
        markedAt: Date.now(),
      });
      return existing[0]._id;
    }

    return await ctx.db.insert("sessionAttendance", {
      sessionId: args.sessionId,
      userId: args.userId,
      status: args.status,
      notes: args.notes,
      markedBy: caller._id,
      markedAt: Date.now(),
    });
  },
});

export const getBySession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    await requireAdminOrFacilitator(ctx);
    const records = await ctx.db
      .query("sessionAttendance")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .take(200);

    const enriched = await Promise.all(
      records.map(async (r) => {
        const user = await ctx.db.get(r.userId);
        return { ...r, user };
      }),
    );
    return enriched;
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    const records = await ctx.db
      .query("sessionAttendance")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .take(200);

    const enriched = await Promise.all(
      records.map(async (r) => {
        const session = await ctx.db.get(r.sessionId);
        return { ...r, session };
      }),
    );
    return enriched;
  },
});

export const getMyAttendance = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const records = await ctx.db
      .query("sessionAttendance")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(200);

    const enriched = await Promise.all(
      records.map(async (r) => {
        const session = await ctx.db.get(r.sessionId);
        return { ...r, session };
      }),
    );
    return enriched;
  },
});

export const enrollUser = mutation({
  args: {
    sessionId: v.id("sessions"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireAdminOrFacilitator(ctx);

    const existing = await ctx.db
      .query("sessionEnrollments")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .take(200);

    if (existing.some((e) => e.userId === args.userId && e.status === "enrolled")) {
      throw new Error("User is already enrolled.");
    }

    return await ctx.db.insert("sessionEnrollments", {
      sessionId: args.sessionId,
      userId: args.userId,
      enrolledAt: Date.now(),
      status: "enrolled",
    });
  },
});

export const dropUser = mutation({
  args: {
    sessionId: v.id("sessions"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireAdminOrFacilitator(ctx);

    const enrollments = await ctx.db
      .query("sessionEnrollments")
      .withIndex("by_sessionId_and_status", (q) =>
        q.eq("sessionId", args.sessionId).eq("status", "enrolled"),
      )
      .take(200);

    const enrollment = enrollments.find((e) => e.userId === args.userId);
    if (!enrollment) throw new Error("User is not enrolled.");

    await ctx.db.patch(enrollment._id, { status: "dropped" });
    return enrollment._id;
  },
});

export const enrollCohort = mutation({
  args: {
    sessionId: v.id("sessions"),
    cohortId: v.id("cohorts"),
  },
  handler: async (ctx, args) => {
    await requireAdminOrFacilitator(ctx);

    const memberships = await ctx.db
      .query("cohortMemberships")
      .withIndex("by_cohortId_and_status", (q) =>
        q.eq("cohortId", args.cohortId).eq("status", "active"),
      )
      .take(200);

    const existingEnrollments = await ctx.db
      .query("sessionEnrollments")
      .withIndex("by_sessionId_and_status", (q) =>
        q.eq("sessionId", args.sessionId).eq("status", "enrolled"),
      )
      .take(200);
    const enrolledUserIds = new Set(existingEnrollments.map((e) => e.userId));

    let count = 0;
    for (const m of memberships) {
      if (!enrolledUserIds.has(m.userId)) {
        await ctx.db.insert("sessionEnrollments", {
          sessionId: args.sessionId,
          userId: m.userId,
          enrolledAt: Date.now(),
          status: "enrolled",
        });
        count++;
      }
    }
    return count;
  },
});

export const getEnrollments = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    const enrollments = await ctx.db
      .query("sessionEnrollments")
      .withIndex("by_sessionId_and_status", (q) =>
        q.eq("sessionId", args.sessionId).eq("status", "enrolled"),
      )
      .take(200);

    const enriched = await Promise.all(
      enrollments.map(async (e) => {
        const user = await ctx.db.get(e.userId);
        return { ...e, user };
      }),
    );
    return enriched;
  },
});

import { v } from "convex/values";
import { mutation, query, internalMutation } from "../_generated/server";
import { requireAdmin, requireUser, requireOwnerOrAdmin } from "../authHelpers";

export const assign = mutation({
  args: {
    templateId: v.id("assessmentTemplates"),
    userId: v.id("users"),
    sessionId: v.optional(v.id("sessions")),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const template = await ctx.db.get(args.templateId);
    if (!template || template.status !== "published") {
      throw new Error("Can only assign published templates.");
    }

    return await ctx.db.insert("assessmentAssignments", {
      templateId: args.templateId,
      userId: args.userId,
      sessionId: args.sessionId,
      assignedBy: admin._id,
      dueDate: args.dueDate,
      status: "assigned",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const assignToSession = mutation({
  args: {
    templateId: v.id("assessmentTemplates"),
    sessionId: v.id("sessions"),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const template = await ctx.db.get(args.templateId);
    if (!template || template.status !== "published") {
      throw new Error("Can only assign published templates.");
    }

    const enrollments = await ctx.db
      .query("sessionEnrollments")
      .withIndex("by_sessionId_and_status", (q) =>
        q.eq("sessionId", args.sessionId).eq("status", "enrolled"),
      )
      .take(200);

    let count = 0;
    for (const enrollment of enrollments) {
      // Check if already assigned
      const existing = await ctx.db
        .query("assessmentAssignments")
        .withIndex("by_userId", (q) => q.eq("userId", enrollment.userId))
        .take(200);

      const alreadyAssigned = existing.some(
        (a) => a.templateId === args.templateId && a.sessionId === args.sessionId,
      );

      if (!alreadyAssigned) {
        await ctx.db.insert("assessmentAssignments", {
          templateId: args.templateId,
          userId: enrollment.userId,
          sessionId: args.sessionId,
          assignedBy: admin._id,
          dueDate: args.dueDate,
          status: "assigned",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        count++;
      }
    }

    return count;
  },
});

export const getMyAssignments = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const assignments = await ctx.db
      .query("assessmentAssignments")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(100);

    const enriched = await Promise.all(
      assignments.map(async (a) => {
        const template = await ctx.db.get(a.templateId);
        return { ...a, template };
      }),
    );

    return enriched;
  },
});

export const getById = query({
  args: { assignmentId: v.id("assessmentAssignments") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) return null;

    if (user.role !== "admin" && assignment.userId !== user._id) {
      throw new Error("Unauthorized.");
    }

    const template = await ctx.db.get(assignment.templateId);
    const response = await ctx.db
      .query("assessmentResponses")
      .withIndex("by_assignmentId", (q) => q.eq("assignmentId", args.assignmentId))
      .take(1);

    const score = await ctx.db
      .query("assessmentScores")
      .withIndex("by_assignmentId", (q) => q.eq("assignmentId", args.assignmentId))
      .take(1);

    return {
      ...assignment,
      template,
      response: response[0] || null,
      score: score[0] || null,
    };
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireOwnerOrAdmin(ctx, args.userId);
    const assignments = await ctx.db
      .query("assessmentAssignments")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .take(100);

    const enriched = await Promise.all(
      assignments.map(async (a) => {
        const template = await ctx.db.get(a.templateId);
        return { ...a, template };
      }),
    );
    return enriched;
  },
});

export const markOverdue = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const assigned = await ctx.db
      .query("assessmentAssignments")
      .withIndex("by_status", (q) => q.eq("status", "assigned"))
      .take(200);

    const inProgress = await ctx.db
      .query("assessmentAssignments")
      .withIndex("by_status", (q) => q.eq("status", "in_progress"))
      .take(200);

    const pending = [...assigned, ...inProgress];
    let count = 0;

    for (const a of pending) {
      if (a.dueDate && a.dueDate < now) {
        await ctx.db.patch(a._id, { status: "overdue", updatedAt: now });
        count++;
      }
    }

    return count;
  },
});

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireAdminOrFacilitator, requireUser } from "./authHelpers";

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
    if (args.status) {
      return await ctx.db.query("sessions").withIndex("by_status", (q) => q.eq("status", args.status!)).take(200);
    }
    return await ctx.db.query("sessions").take(200);
  },
});

export const getById = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    return await ctx.db.get(args.sessionId);
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
    return sessionId;
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
          return session ? { ...session, enrollment: e } : null;
        }),
    );
    return sessions.filter(Boolean);
  },
});

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser, requireOwnerOrAdmin } from "./authHelpers";

const stageValidator = v.union(
  v.literal("primary"),
  v.literal("jss"),
  v.literal("sss"),
  v.literal("jamb"),
  v.literal("university"),
  v.literal("polytechnic"),
  v.literal("coe"),
  v.literal("nysc"),
  v.literal("post_nysc"),
);

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireOwnerOrAdmin(ctx, args.userId);

    return await ctx.db
      .query("educationRecords")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .take(50);
  },
});

export const getMyRecords = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    return await ctx.db
      .query("educationRecords")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(50);
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    stage: stageValidator,
    isCurrent: v.boolean(),
    institutionName: v.optional(v.string()),
    startYear: v.optional(v.number()),
    endYear: v.optional(v.number()),
    qualification: v.optional(v.string()),
    grade: v.optional(v.string()),
    jambScore: v.optional(v.number()),
    courseOfStudy: v.optional(v.string()),
    nyscState: v.optional(v.string()),
    nyscPpa: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireOwnerOrAdmin(ctx, args.userId);

    // If setting as current, unset any existing current records
    if (args.isCurrent) {
      const currentRecords = await ctx.db
        .query("educationRecords")
        .withIndex("by_userId_and_isCurrent", (q) =>
          q.eq("userId", args.userId).eq("isCurrent", true),
        )
        .take(10);

      for (const record of currentRecords) {
        await ctx.db.patch(record._id, { isCurrent: false, updatedAt: Date.now() });
      }
    }

    return await ctx.db.insert("educationRecords", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    recordId: v.id("educationRecords"),
    stage: v.optional(stageValidator),
    isCurrent: v.optional(v.boolean()),
    institutionName: v.optional(v.string()),
    startYear: v.optional(v.number()),
    endYear: v.optional(v.number()),
    qualification: v.optional(v.string()),
    grade: v.optional(v.string()),
    jambScore: v.optional(v.number()),
    courseOfStudy: v.optional(v.string()),
    nyscState: v.optional(v.string()),
    nyscPpa: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.recordId);
    if (!record) throw new Error("Record not found.");

    await requireOwnerOrAdmin(ctx, record.userId);

    // If setting as current, unset others
    if (args.isCurrent) {
      const currentRecords = await ctx.db
        .query("educationRecords")
        .withIndex("by_userId_and_isCurrent", (q) =>
          q.eq("userId", record.userId).eq("isCurrent", true),
        )
        .take(10);

      for (const r of currentRecords) {
        if (r._id !== args.recordId) {
          await ctx.db.patch(r._id, { isCurrent: false, updatedAt: Date.now() });
        }
      }
    }

    const { recordId: _recordId, ...updates } = args;
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) patch[key] = value;
    }

    await ctx.db.patch(args.recordId, patch);
    return args.recordId;
  },
});

export const remove = mutation({
  args: { recordId: v.id("educationRecords") },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.recordId);
    if (!record) throw new Error("Record not found.");

    await requireOwnerOrAdmin(ctx, record.userId);
    await ctx.db.delete(args.recordId);
  },
});

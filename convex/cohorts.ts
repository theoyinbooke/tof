import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireUser } from "./authHelpers";
import { notifyWithEmail } from "./emailHelpers";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    return await ctx.db.query("cohorts").take(100);
  },
});

export const getById = query({
  args: { cohortId: v.id("cohorts") },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    return await ctx.db.get(args.cohortId);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("cohorts", {
      name: args.name,
      description: args.description,
      startDate: args.startDate,
      endDate: args.endDate,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    cohortId: v.id("cohorts"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { cohortId, ...updates } = args;
    const cohort = await ctx.db.get(cohortId);
    if (!cohort) throw new Error("Cohort not found.");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.description !== undefined)
      patch.description = updates.description;
    if (updates.startDate !== undefined) patch.startDate = updates.startDate;
    if (updates.endDate !== undefined) patch.endDate = updates.endDate;
    if (updates.isActive !== undefined) patch.isActive = updates.isActive;

    await ctx.db.patch(cohortId, patch);
    return cohortId;
  },
});

export const addMember = mutation({
  args: {
    cohortId: v.id("cohorts"),
    userId: v.id("users"),
    status: v.optional(
      v.union(
        v.literal("applicant"),
        v.literal("active"),
        v.literal("paused"),
        v.literal("completed"),
        v.literal("alumni"),
        v.literal("withdrawn"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existing = await ctx.db
      .query("cohortMemberships")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .take(100);

    const alreadyInCohort = existing.find(
      (m) => m.cohortId === args.cohortId,
    );
    if (alreadyInCohort) {
      throw new Error("User is already a member of this cohort.");
    }

    const membershipId = await ctx.db.insert("cohortMemberships", {
      cohortId: args.cohortId,
      userId: args.userId,
      status: args.status || "active",
      joinedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Email beneficiary about cohort enrollment
    const cohort = await ctx.db.get(args.cohortId);
    const cohortName = cohort?.name || "a cohort";

    await notifyWithEmail(ctx, {
      userId: args.userId,
      type: "cohort_enrollment",
      title: `Enrolled in ${cohortName}`,
      body: `You have been enrolled in ${cohortName}.`,
      eventKey: `cohort_enrollment:${membershipId}`,
      linkUrl: "/beneficiary/sessions",
      emailType: "cohort-enrollment",
      templateData: { cohortName },
    });

    return membershipId;
  },
});

export const updateMemberStatus = mutation({
  args: {
    membershipId: v.id("cohortMemberships"),
    status: v.union(
      v.literal("applicant"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("alumni"),
      v.literal("withdrawn"),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const membership = await ctx.db.get(args.membershipId);
    if (!membership) throw new Error("Membership not found.");

    await ctx.db.patch(args.membershipId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return args.membershipId;
  },
});

export const listMembers = query({
  args: {
    cohortId: v.id("cohorts"),
  },
  handler: async (ctx, args) => {
    await requireUser(ctx);

    const memberships = await ctx.db
      .query("cohortMemberships")
      .withIndex("by_cohortId", (q) => q.eq("cohortId", args.cohortId))
      .take(200);

    const members = await Promise.all(
      memberships.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        return { ...m, user };
      }),
    );

    return members;
  },
});

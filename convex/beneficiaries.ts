import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  requireUser,
  requireAdmin,
  requireOwnerOrAdmin,
} from "./authHelpers";

const PROFILE_FIELDS = {
  personal: [
    "firstName",
    "lastName",
    "dateOfBirth",
    "gender",
    "phone",
    "address",
    "stateOfOrigin",
    "lga",
  ],
  family: [
    "guardianName",
    "guardianPhone",
    "guardianRelationship",
    "familySize",
    "householdIncome",
  ],
} as const;

function calculateCompletion(
  profile: Record<string, unknown>,
): number {
  const allFields = [...PROFILE_FIELDS.personal, ...PROFILE_FIELDS.family];
  const filled = allFields.filter(
    (f) =>
      profile[f] !== undefined &&
      profile[f] !== null &&
      profile[f] !== "",
  );
  return Math.round((filled.length / allFields.length) * 100);
}

export const getProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireOwnerOrAdmin(ctx, args.userId);

    return await ctx.db
      .query("beneficiaryProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    return await ctx.db
      .query("beneficiaryProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
  },
});

export const createProfile = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireOwnerOrAdmin(ctx, args.userId);

    const existing = await ctx.db
      .query("beneficiaryProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("beneficiaryProfiles", {
      userId: args.userId,
      lifecycleStatus: "applicant",
      profileCompletionPercent: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updatePersonalInfo = mutation({
  args: {
    userId: v.id("users"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    gender: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    stateOfOrigin: v.optional(v.string()),
    lga: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireOwnerOrAdmin(ctx, args.userId);

    const profile = await ctx.db
      .query("beneficiaryProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!profile) throw new Error("Profile not found. Create one first.");

    const { userId: _userId, ...updates } = args;
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) patch[key] = value;
    }

    const merged = { ...profile, ...patch };
    patch.profileCompletionPercent = calculateCompletion(
      merged as unknown as Record<string, unknown>,
    );

    await ctx.db.patch(profile._id, patch);
    return profile._id;
  },
});

export const updateFamilyContext = mutation({
  args: {
    userId: v.id("users"),
    guardianName: v.optional(v.string()),
    guardianPhone: v.optional(v.string()),
    guardianRelationship: v.optional(v.string()),
    familySize: v.optional(v.number()),
    householdIncome: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireOwnerOrAdmin(ctx, args.userId);

    const profile = await ctx.db
      .query("beneficiaryProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!profile) throw new Error("Profile not found. Create one first.");

    const { userId: _userId, ...updates } = args;
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) patch[key] = value;
    }

    const merged = { ...profile, ...patch };
    patch.profileCompletionPercent = calculateCompletion(
      merged as unknown as Record<string, unknown>,
    );

    await ctx.db.patch(profile._id, patch);
    return profile._id;
  },
});

export const updateLifecycleStatus = mutation({
  args: {
    userId: v.id("users"),
    lifecycleStatus: v.union(
      v.literal("applicant"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("alumni"),
      v.literal("withdrawn"),
    ),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const profile = await ctx.db
      .query("beneficiaryProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!profile) throw new Error("Profile not found.");

    const patch: Record<string, unknown> = {
      lifecycleStatus: args.lifecycleStatus,
      updatedAt: Date.now(),
    };
    if (args.adminNotes !== undefined) patch.adminNotes = args.adminNotes;

    await ctx.db.patch(profile._id, patch);
    return profile._id;
  },
});

export const listBeneficiaries = query({
  args: {
    lifecycleStatus: v.optional(
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

    let profiles;
    if (args.lifecycleStatus) {
      profiles = await ctx.db
        .query("beneficiaryProfiles")
        .withIndex("by_lifecycleStatus", (q) =>
          q.eq("lifecycleStatus", args.lifecycleStatus!),
        )
        .take(200);
    } else {
      profiles = await ctx.db
        .query("beneficiaryProfiles")
        .take(200);
    }

    const enriched = await Promise.all(
      profiles.map(async (p) => {
        const user = await ctx.db.get(p.userId);
        return { ...p, user };
      }),
    );

    return enriched;
  },
});

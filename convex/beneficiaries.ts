import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import {
  requireUser,
  requireAdmin,
  requireOwnerOrAdmin,
} from "./authHelpers";
import type { Doc } from "./_generated/dataModel";

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

function formatProfileName(firstName?: string, lastName?: string) {
  return [firstName?.trim(), lastName?.trim()].filter(Boolean).join(" ");
}

function isDirectoryEligible(
  user: Doc<"users"> | null,
  profile: {
    lifecycleStatus:
      | "applicant"
      | "active"
      | "paused"
      | "completed"
      | "alumni"
      | "withdrawn";
  },
) {
  if (!user || !user.isActive) return false;
  if (user.role === "beneficiary") return true;
  return user.role === "mentor" && profile.lifecycleStatus === "alumni";
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

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found.");
    if (user.role !== "beneficiary") {
      throw new Error("Only beneficiary accounts can create beneficiary profiles.");
    }

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

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found.");

    const profile = await ctx.db
      .query("beneficiaryProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!profile) throw new Error("Profile not found. Create one first.");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(args)) {
      if (key === "userId") continue;
      if (value !== undefined) patch[key] = value;
    }

    const merged = { ...profile, ...patch };
    patch.profileCompletionPercent = calculateCompletion(
      merged as unknown as Record<string, unknown>,
    );

    await ctx.db.patch(profile._id, patch);

    const fullName = formatProfileName(args.firstName, args.lastName);
    if (fullName && fullName !== user.name) {
      await ctx.db.patch(args.userId, {
        name: fullName,
        updatedAt: Date.now(),
      });
    }

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

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(args)) {
      if (key === "userId") continue;
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

export const updateProfilePicture = mutation({
  args: {
    userId: v.id("users"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await requireOwnerOrAdmin(ctx, args.userId);

    const profile = await ctx.db
      .query("beneficiaryProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!profile) throw new Error("Profile not found. Create one first.");

    // Delete old profile picture if it exists
    if (profile.profilePictureStorageId) {
      await ctx.storage.delete(profile.profilePictureStorageId);
    }

    await ctx.db.patch(profile._id, {
      profilePictureStorageId: args.storageId,
      updatedAt: Date.now(),
    });

    return profile._id;
  },
});

export const getProfilePictureUrl = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireOwnerOrAdmin(ctx, args.userId);

    const profile = await ctx.db
      .query("beneficiaryProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!profile?.profilePictureStorageId) return null;

    return await ctx.storage.getUrl(profile.profilePictureStorageId);
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

    return enriched.filter((profile) => isDirectoryEligible(profile.user, profile));
  },
});

export const reconcileDirectory = internalMutation({
  args: {
    dryRun: v.boolean(),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").take(500);
    const profiles = await ctx.db.query("beneficiaryProfiles").take(500);

    const profilesByUserId = new Map<Doc<"users">["_id"], Doc<"beneficiaryProfiles">>();
    for (const profile of profiles) {
      profilesByUserId.set(profile.userId, profile);
    }

    const now = Date.now();
    const createdProfiles: Array<{ userId: Doc<"users">["_id"]; email: string }> = [];
    const deletedProfiles: Array<{ profileId: Doc<"beneficiaryProfiles">["_id"]; email: string; role: Doc<"users">["role"] }> = [];
    const renamedUsers: Array<{ userId: Doc<"users">["_id"]; from: string; to: string }> = [];
    const keptHistoricalProfiles: Array<{ userId: Doc<"users">["_id"]; email: string }> = [];

    for (const user of users) {
      const profile = profilesByUserId.get(user._id);

      if (user.role === "beneficiary" && !profile) {
        createdProfiles.push({ userId: user._id, email: user.email });
        if (!args.dryRun) {
          await ctx.db.insert("beneficiaryProfiles", {
            userId: user._id,
            lifecycleStatus: "applicant",
            profileCompletionPercent: 0,
            createdAt: now,
            updatedAt: now,
          });
        }
        continue;
      }

      if (!profile) {
        continue;
      }

      const fullName = formatProfileName(profile.firstName, profile.lastName);
      if (fullName && fullName !== user.name) {
        renamedUsers.push({ userId: user._id, from: user.name, to: fullName });
        if (!args.dryRun) {
          await ctx.db.patch(user._id, {
            name: fullName,
            updatedAt: now,
          });
        }
      }

      if (user.role === "admin" || user.role === "facilitator") {
        deletedProfiles.push({
          profileId: profile._id,
          email: user.email,
          role: user.role,
        });
        if (!args.dryRun) {
          if (profile.profilePictureStorageId) {
            await ctx.storage.delete(profile.profilePictureStorageId);
          }
          await ctx.db.delete(profile._id);
        }
        continue;
      }

      if (user.role === "mentor") {
        if (profile.lifecycleStatus === "alumni") {
          keptHistoricalProfiles.push({ userId: user._id, email: user.email });
        } else {
          deletedProfiles.push({
            profileId: profile._id,
            email: user.email,
            role: user.role,
          });
          if (!args.dryRun) {
            if (profile.profilePictureStorageId) {
              await ctx.storage.delete(profile.profilePictureStorageId);
            }
            await ctx.db.delete(profile._id);
          }
        }
      }
    }

    return {
      scannedUsers: users.length,
      scannedProfiles: profiles.length,
      createdProfiles,
      deletedProfiles,
      renamedUsers,
      keptHistoricalProfiles,
    };
  },
});

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { logAuditEvent } from "./auditLogs";

export const getOrCreateUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (existing) {
      const updates: Record<string, unknown> = { updatedAt: Date.now() };
      if (identity.name && identity.name !== existing.name) {
        updates.name = identity.name;
      }
      if (identity.email && identity.email !== existing.email) {
        updates.email = identity.email;
      }
      if (identity.pictureUrl && identity.pictureUrl !== existing.avatarUrl) {
        updates.avatarUrl = identity.pictureUrl;
      }
      await ctx.db.patch(existing._id, updates);
      return existing._id;
    }

    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email || "",
      name: identity.name || "",
      role: "beneficiary",
      isActive: true,
      avatarUrl: identity.pictureUrl,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    return user;
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.get(args.userId);
  },
});

export const listUsers = query({
  args: {
    role: v.optional(
      v.union(
        v.literal("admin"),
        v.literal("facilitator"),
        v.literal("mentor"),
        v.literal("beneficiary"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const caller = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!caller || caller.role !== "admin") {
      throw new Error("Only admins can list users.");
    }

    if (args.role) {
      return await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", args.role!))
        .take(200);
    }

    return await ctx.db.query("users").take(200);
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("admin"),
      v.literal("facilitator"),
      v.literal("mentor"),
      v.literal("beneficiary"),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const caller = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!caller || caller.role !== "admin") {
      throw new Error("Only admins can change roles.");
    }

    const target = await ctx.db.get(args.userId);
    if (!target) {
      throw new Error("User not found.");
    }

    await ctx.db.patch(args.userId, {
      role: args.role,
      updatedAt: Date.now(),
    });

    await logAuditEvent(ctx, {
      userId: caller._id,
      action: "update_user_role",
      resource: "users",
      resourceId: args.userId,
      details: `Changed role from "${target.role}" to "${args.role}"`,
    });

    return args.userId;
  },
});

export const toggleUserActive = mutation({
  args: {
    userId: v.id("users"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const caller = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!caller || caller.role !== "admin") {
      throw new Error("Only admins can activate/deactivate users.");
    }

    await ctx.db.patch(args.userId, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });

    await logAuditEvent(ctx, {
      userId: caller._id,
      action: args.isActive ? "activate_user" : "deactivate_user",
      resource: "users",
      resourceId: args.userId,
    });

    return args.userId;
  },
});

import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { logAuditEvent } from "./auditLogs";
import { notifyWithEmail } from "./emailHelpers";
import { requireUser } from "./authHelpers";

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

    // Send welcome email
    if (identity.email) {
      await notifyWithEmail(ctx, {
        userId,
        type: "welcome",
        title: "Welcome to TheOyinbooke Foundation",
        body: "Welcome! Get started by completing your profile.",
        eventKey: `welcome:${userId}`,
        linkUrl: "/dashboard",
        emailType: "welcome",
        templateData: {
          recipientName: identity.name || "there",
        },
      });
    }

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

export const listByRole = query({
  args: {
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

    return await ctx.db
      .query("users")
      .withIndex("by_role_and_isActive", (q) =>
        q.eq("role", args.role).eq("isActive", true),
      )
      .take(200);
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

    // Send role assigned email
    await notifyWithEmail(ctx, {
      userId: args.userId,
      type: "role_assigned",
      title: `Your role has been updated to ${args.role}`,
      body: `Your role has been changed from ${target.role} to ${args.role}.`,
      eventKey: `role_assigned:${args.userId}:${Date.now()}`,
      linkUrl: "/dashboard",
      emailType: "role-assigned",
      templateData: {
        recipientName: target.name,
        newRole: args.role,
      },
    });

    return args.userId;
  },
});

export const searchBeneficiaries = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    if (user.role !== "admin") throw new Error("Unauthorized");

    const beneficiaries = await ctx.db
      .query("users")
      .withIndex("by_role_and_isActive", (q) =>
        q.eq("role", "beneficiary").eq("isActive", true),
      )
      .take(200);

    if (!args.search) return beneficiaries.slice(0, 50);

    const term = args.search.toLowerCase();
    return beneficiaries.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term),
    );
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

    const target = await ctx.db.get(args.userId);
    if (!target) throw new Error("User not found.");

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

    // Send deactivation email
    if (!args.isActive) {
      await notifyWithEmail(ctx, {
        userId: args.userId,
        type: "account_deactivated",
        title: "Your account has been deactivated",
        body: "Your account has been deactivated by an administrator.",
        eventKey: `account_deactivated:${args.userId}:${Date.now()}`,
        emailType: "account-deactivated",
        templateData: {
          recipientName: target.name,
        },
      });
    }

    return args.userId;
  },
});

// ─── Webhook-based user sync (called from Next.js API route) ───
// Handles both user.created and user.updated events from Clerk.

export const createOrUpdateFromWebhook = internalMutation({
  args: {
    clerkId: v.string(),
    tokenIdentifier: v.string(),
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists by clerkId
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      // Update name, email, avatar if changed
      const updates: Record<string, unknown> = { updatedAt: Date.now() };
      if (args.name && args.name !== existing.name) updates.name = args.name;
      if (args.email && args.email !== existing.email) updates.email = args.email;
      if (args.avatarUrl && args.avatarUrl !== existing.avatarUrl) updates.avatarUrl = args.avatarUrl;
      await ctx.db.patch(existing._id, updates);
      return existing._id;
    }

    // Also check by email to avoid duplicates
    const existingByEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existingByEmail) {
      await ctx.db.patch(existingByEmail._id, {
        clerkId: args.clerkId,
        name: args.name || existingByEmail.name,
        avatarUrl: args.avatarUrl ?? existingByEmail.avatarUrl,
        updatedAt: Date.now(),
      });
      return existingByEmail._id;
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      tokenIdentifier: args.tokenIdentifier,
      email: args.email,
      name: args.name,
      role: "beneficiary",
      isActive: true,
      avatarUrl: args.avatarUrl,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Send welcome email
    if (args.email) {
      await notifyWithEmail(ctx, {
        userId,
        type: "welcome",
        title: "Welcome to TheOyinbooke Foundation",
        body: "Welcome! Get started by completing your profile.",
        eventKey: `welcome:${userId}`,
        linkUrl: "/dashboard",
        emailType: "welcome",
        templateData: {
          recipientName: args.name || "there",
        },
      });
    }

    return userId;
  },
});

import { v } from "convex/values";
import {
  internalMutation,
  mutation,
  query,
  type MutationCtx,
} from "./_generated/server";
import { logAuditEvent } from "./auditLogs";
import { notifyWithEmail } from "./emailHelpers";
import { requireUser } from "./authHelpers";

type SyncedUserFields = {
  clerkId: string;
  tokenIdentifier: string;
  email: string;
  name: string;
  avatarUrl?: string;
};

function buildUserPatch(
  existing: {
    clerkId: string;
    tokenIdentifier: string;
    email: string;
    name: string;
    avatarUrl?: string;
  },
  fields: SyncedUserFields,
) {
  const updates: Record<string, unknown> = {};

  if (existing.clerkId !== fields.clerkId) {
    updates.clerkId = fields.clerkId;
  }
  if (existing.tokenIdentifier !== fields.tokenIdentifier) {
    updates.tokenIdentifier = fields.tokenIdentifier;
  }
  if (existing.email !== fields.email) {
    updates.email = fields.email;
  }
  if (existing.name !== fields.name) {
    updates.name = fields.name;
  }
  if (existing.avatarUrl !== fields.avatarUrl) {
    updates.avatarUrl = fields.avatarUrl;
  }

  if (Object.keys(updates).length === 0) {
    return null;
  }

  updates.updatedAt = Date.now();
  return updates;
}

async function upsertUserFromFields(ctx: MutationCtx, fields: SyncedUserFields) {
  const existingByTokenIdentifier = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", fields.tokenIdentifier),
    )
    .unique();

  if (existingByTokenIdentifier) {
    const updates = buildUserPatch(existingByTokenIdentifier, fields);
    if (updates) {
      await ctx.db.patch(existingByTokenIdentifier._id, updates);
    }
    return { userId: existingByTokenIdentifier._id, created: false };
  }

  const existingByClerkId = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", fields.clerkId))
    .unique();

  if (existingByClerkId) {
    const updates = buildUserPatch(existingByClerkId, fields);
    if (updates) {
      await ctx.db.patch(existingByClerkId._id, updates);
    }
    return { userId: existingByClerkId._id, created: false };
  }

  if (fields.email) {
    const existingByEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", fields.email))
      .unique();

    if (existingByEmail) {
      const updates = buildUserPatch(existingByEmail, fields) ?? {
        updatedAt: Date.now(),
      };
      await ctx.db.patch(existingByEmail._id, updates);
      return { userId: existingByEmail._id, created: false };
    }
  }

  const userId = await ctx.db.insert("users", {
    clerkId: fields.clerkId,
    tokenIdentifier: fields.tokenIdentifier,
    email: fields.email,
    name: fields.name,
    role: "beneficiary",
    isActive: true,
    avatarUrl: fields.avatarUrl,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return { userId, created: true };
}

export const getOrCreateUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const fields: SyncedUserFields = {
      clerkId: identity.subject,
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email || "",
      name: identity.name || "",
      avatarUrl: identity.pictureUrl,
    };
    const { userId, created } = await upsertUserFromFields(ctx, fields);

    // Send welcome email
    if (created && identity.email) {
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
    const { userId, created } = await upsertUserFromFields(ctx, args);

    // Send welcome email
    if (created && args.email) {
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

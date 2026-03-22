import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser, requireOwnerOrAdmin, requireAdmin } from "./authHelpers";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    ownerId: v.id("users"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    category: v.union(
      v.literal("identity"),
      v.literal("education"),
      v.literal("support_evidence"),
      v.literal("other"),
    ),
    visibility: v.union(
      v.literal("owner_only"),
      v.literal("admin_only"),
      v.literal("owner_and_admin"),
    ),
    linkedProfileId: v.optional(v.id("beneficiaryProfiles")),
    linkedSupportRequestId: v.optional(v.id("supportRequests")),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    return await ctx.db.insert("documents", {
      ...args,
      uploaderId: user._id,
      createdAt: Date.now(),
    });
  },
});

export const listByOwner = query({
  args: {
    ownerId: v.id("users"),
    category: v.optional(
      v.union(
        v.literal("identity"),
        v.literal("education"),
        v.literal("support_evidence"),
        v.literal("other"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await requireOwnerOrAdmin(ctx, args.ownerId);

    let docs;
    if (args.category) {
      docs = await ctx.db
        .query("documents")
        .withIndex("by_ownerId_and_category", (q) =>
          q.eq("ownerId", args.ownerId).eq("category", args.category!),
        )
        .take(100);
    } else {
      docs = await ctx.db
        .query("documents")
        .withIndex("by_ownerId", (q) => q.eq("ownerId", args.ownerId))
        .take(100);
    }

    return docs;
  },
});

export const getMyDocuments = query({
  args: {
    category: v.optional(
      v.union(
        v.literal("identity"),
        v.literal("education"),
        v.literal("support_evidence"),
        v.literal("other"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    if (args.category) {
      return await ctx.db
        .query("documents")
        .withIndex("by_ownerId_and_category", (q) =>
          q.eq("ownerId", user._id).eq("category", args.category!),
        )
        .take(100);
    }

    return await ctx.db
      .query("documents")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", user._id))
      .take(100);
  },
});

export const getUrl = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const doc = await ctx.db.get(args.documentId);
    if (!doc) throw new Error("Document not found.");

    // Enforce visibility
    if (doc.visibility === "owner_only" && doc.ownerId !== user._id && user.role !== "admin") {
      throw new Error("You do not have access to this document.");
    }
    if (doc.visibility === "admin_only" && user.role !== "admin") {
      throw new Error("Only admins can access this document.");
    }
    if (
      doc.visibility === "owner_and_admin" &&
      doc.ownerId !== user._id &&
      user.role !== "admin"
    ) {
      throw new Error("You do not have access to this document.");
    }

    const url = await ctx.storage.getUrl(doc.storageId);
    return { ...doc, url };
  },
});

export const remove = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (!doc) throw new Error("Document not found.");

    const user = await requireUser(ctx);

    // Only owner or admin can delete
    if (doc.ownerId !== user._id && user.role !== "admin") {
      throw new Error("You can only delete your own documents.");
    }

    await ctx.storage.delete(doc.storageId);
    await ctx.db.delete(args.documentId);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("documents").take(200);
  },
});

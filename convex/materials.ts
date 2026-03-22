import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireUser } from "./authHelpers";
import { notifyWithEmail } from "./emailHelpers";

const typeValidator = v.union(
  v.literal("pdf"),
  v.literal("docx"),
  v.literal("youtube"),
  v.literal("link"),
  v.literal("audio"),
);

export const list = query({
  args: {
    pillar: v.optional(v.string()),
    sessionId: v.optional(v.id("sessions")),
  },
  handler: async (ctx, args) => {
    await requireUser(ctx);

    if (args.sessionId) {
      return await ctx.db
        .query("materials")
        .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
        .take(200);
    }
    if (args.pillar) {
      return await ctx.db
        .query("materials")
        .withIndex("by_pillar", (q) => q.eq("pillar", args.pillar))
        .take(200);
    }
    return await ctx.db.query("materials").take(200);
  },
});

export const getById = query({
  args: { materialId: v.id("materials") },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    return await ctx.db.get(args.materialId);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    type: typeValidator,
    url: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    pillar: v.optional(v.string()),
    sessionId: v.optional(v.id("sessions")),
    isRequired: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);
    const materialId = await ctx.db.insert("materials", {
      ...args,
      createdBy: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Notify enrolled users if the material is linked to a session
    if (args.sessionId) {
      const session = await ctx.db.get(args.sessionId);
      const enrollments = await ctx.db
        .query("sessionEnrollments")
        .withIndex("by_sessionId_and_status", (q) =>
          q.eq("sessionId", args.sessionId!).eq("status", "enrolled"),
        )
        .take(200);

      for (const enrollment of enrollments) {
        await notifyWithEmail(ctx, {
          userId: enrollment.userId,
          type: "new_material",
          title: `New material: ${args.title}`,
          body: `A new ${args.type} has been added${session ? ` to "${session.title}"` : ""}.`,
          eventKey: `new_material:${materialId}:${enrollment.userId}`,
          linkUrl: "/library",
          emailType: "new-material",
          templateData: {
            materialTitle: args.title,
            materialType: args.type,
            sessionTitle: session?.title || "",
          },
        });
      }
    }

    return materialId;
  },
});

export const update = mutation({
  args: {
    materialId: v.id("materials"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(typeValidator),
    url: v.optional(v.string()),
    pillar: v.optional(v.string()),
    sessionId: v.optional(v.id("sessions")),
    isRequired: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { materialId, ...updates } = args;
    const material = await ctx.db.get(materialId);
    if (!material) throw new Error("Material not found.");
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) patch[key] = val;
    }
    await ctx.db.patch(materialId, patch);
    return materialId;
  },
});

export const remove = mutation({
  args: { materialId: v.id("materials") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const material = await ctx.db.get(args.materialId);
    if (!material) throw new Error("Material not found.");
    if (material.storageId) {
      await ctx.storage.delete(material.storageId);
    }
    await ctx.db.delete(args.materialId);
  },
});

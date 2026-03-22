import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireAdmin, requireUser } from "../authHelpers";

const statusValidator = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("archived"),
);

const itemValidator = v.object({
  itemNumber: v.number(),
  text: v.string(),
  subscale: v.optional(v.string()),
  isReversed: v.boolean(),
  responseOptions: v.array(
    v.object({
      label: v.string(),
      value: v.number(),
    }),
  ),
});

const subscaleValidator = v.object({
  name: v.string(),
  itemNumbers: v.array(v.number()),
});

const severityBandValidator = v.object({
  label: v.string(),
  min: v.number(),
  max: v.number(),
  flagBehavior: v.optional(
    v.union(v.literal("none"), v.literal("mentor_notify"), v.literal("admin_review")),
  ),
});

export const list = query({
  args: { status: v.optional(statusValidator) },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    if (args.status) {
      return await ctx.db
        .query("assessmentTemplates")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .take(100);
    }
    return await ctx.db.query("assessmentTemplates").take(100);
  },
});

export const getById = query({
  args: { templateId: v.id("assessmentTemplates") },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    return await ctx.db.get(args.templateId);
  },
});

export const getByShortCode = query({
  args: { shortCode: v.string() },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    // Get the latest published version
    const templates = await ctx.db
      .query("assessmentTemplates")
      .withIndex("by_shortCode", (q) => q.eq("shortCode", args.shortCode))
      .take(20);

    const published = templates
      .filter((t) => t.status === "published")
      .sort((a, b) => b.version - a.version);

    return published[0] || null;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    shortCode: v.string(),
    description: v.optional(v.string()),
    sourceCitation: v.optional(v.string()),
    licenseNotes: v.optional(v.string()),
    adaptationNotes: v.optional(v.string()),
    pillar: v.optional(v.string()),
    sessionNumber: v.optional(v.number()),
    items: v.array(itemValidator),
    subscales: v.optional(v.array(subscaleValidator)),
    severityBands: v.optional(v.array(severityBandValidator)),
    totalScoreRange: v.optional(v.object({ min: v.number(), max: v.number() })),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    // Determine version number
    const existing = await ctx.db
      .query("assessmentTemplates")
      .withIndex("by_shortCode", (q) => q.eq("shortCode", args.shortCode))
      .take(100);

    const maxVersion = existing.reduce((max, t) => Math.max(max, t.version), 0);

    return await ctx.db.insert("assessmentTemplates", {
      ...args,
      version: maxVersion + 1,
      status: "draft",
      createdBy: admin._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateDraft = mutation({
  args: {
    templateId: v.id("assessmentTemplates"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    sourceCitation: v.optional(v.string()),
    licenseNotes: v.optional(v.string()),
    adaptationNotes: v.optional(v.string()),
    pillar: v.optional(v.string()),
    sessionNumber: v.optional(v.number()),
    items: v.optional(v.array(itemValidator)),
    subscales: v.optional(v.array(subscaleValidator)),
    severityBands: v.optional(v.array(severityBandValidator)),
    totalScoreRange: v.optional(v.object({ min: v.number(), max: v.number() })),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Template not found.");
    if (template.status !== "draft") {
      throw new Error("Only draft templates can be edited. Published templates are immutable.");
    }

    const { templateId, ...updates } = args;
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) patch[key] = val;
    }

    await ctx.db.patch(templateId, patch);
    return templateId;
  },
});

export const publish = mutation({
  args: { templateId: v.id("assessmentTemplates") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Template not found.");
    if (template.status !== "draft") {
      throw new Error("Only draft templates can be published.");
    }
    if (template.items.length === 0) {
      throw new Error("Cannot publish a template with no items.");
    }

    await ctx.db.patch(args.templateId, {
      status: "published",
      updatedAt: Date.now(),
    });
    return args.templateId;
  },
});

export const archive = mutation({
  args: { templateId: v.id("assessmentTemplates") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Template not found.");
    if (template.status === "archived") {
      throw new Error("Template is already archived.");
    }

    await ctx.db.patch(args.templateId, {
      status: "archived",
      updatedAt: Date.now(),
    });
    return args.templateId;
  },
});

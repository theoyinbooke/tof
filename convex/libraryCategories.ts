import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireUser } from "./authHelpers";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    return await ctx.db.query("libraryCategories").take(100);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    slug: v.string(),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Check for duplicate slug
    const existing = await ctx.db
      .query("libraryCategories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) {
      throw new Error(`A category with slug "${args.slug}" already exists.`);
    }

    return await ctx.db.insert("libraryCategories", {
      name: args.name,
      description: args.description,
      slug: args.slug,
      sortOrder: args.sortOrder ?? 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    categoryId: v.id("libraryCategories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    slug: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new Error("Category not found.");

    // Check slug uniqueness if changed
    if (args.slug && args.slug !== category.slug) {
      const existing = await ctx.db
        .query("libraryCategories")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug!))
        .unique();
      if (existing) {
        throw new Error(`A category with slug "${args.slug}" already exists.`);
      }
    }

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) patch.name = args.name;
    if (args.description !== undefined) patch.description = args.description;
    if (args.slug !== undefined) patch.slug = args.slug;
    if (args.sortOrder !== undefined) patch.sortOrder = args.sortOrder;

    await ctx.db.patch(args.categoryId, patch);
    return args.categoryId;
  },
});

export const remove = mutation({
  args: { categoryId: v.id("libraryCategories") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new Error("Category not found.");

    // Check if any materials are using this category
    const linked = await ctx.db
      .query("materials")
      .withIndex("by_categoryId", (q) => q.eq("categoryId", args.categoryId))
      .take(1);
    if (linked.length > 0) {
      throw new Error(
        "Cannot delete category that has materials assigned. Reassign or remove them first.",
      );
    }

    await ctx.db.delete(args.categoryId);
  },
});

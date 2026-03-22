import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser, requireAdminOrMentor } from "./authHelpers";

export const create = mutation({
  args: {
    beneficiaryUserId: v.id("users"),
    content: v.string(),
    visibility: v.union(
      v.literal("mentor_only"),
      v.literal("mentor_and_admin"),
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireAdminOrMentor(ctx);

    // Mentors can only create notes for their assigned mentees
    if (user.role === "mentor") {
      const assignments = await ctx.db
        .query("mentorAssignments")
        .withIndex("by_mentorId_and_isActive", (q) =>
          q.eq("mentorId", user._id).eq("isActive", true),
        )
        .take(100);

      const isAssigned = assignments.some(
        (a) => a.beneficiaryUserId === args.beneficiaryUserId,
      );

      if (!isAssigned) {
        throw new Error("You can only create notes for your assigned mentees.");
      }
    }

    return await ctx.db.insert("mentorNotes", {
      mentorId: user._id,
      beneficiaryUserId: args.beneficiaryUserId,
      content: args.content,
      visibility: args.visibility,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    noteId: v.id("mentorNotes"),
    content: v.optional(v.string()),
    visibility: v.optional(
      v.union(v.literal("mentor_only"), v.literal("mentor_and_admin")),
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireAdminOrMentor(ctx);
    const note = await ctx.db.get(args.noteId);
    if (!note) throw new Error("Note not found.");

    // Only the author or admin can edit
    if (user.role !== "admin" && note.mentorId !== user._id) {
      throw new Error("You can only edit your own notes.");
    }

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.content !== undefined) patch.content = args.content;
    if (args.visibility !== undefined) patch.visibility = args.visibility;

    await ctx.db.patch(args.noteId, patch);
    return args.noteId;
  },
});

export const listByBeneficiary = query({
  args: { beneficiaryUserId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await requireAdminOrMentor(ctx);

    const notes = await ctx.db
      .query("mentorNotes")
      .withIndex("by_beneficiaryUserId", (q) =>
        q.eq("beneficiaryUserId", args.beneficiaryUserId),
      )
      .order("desc")
      .take(100);

    // Filter by visibility
    const filtered = notes.filter((n) => {
      if (user.role === "admin") return true;
      if (n.mentorId === user._id) return true;
      if (n.visibility === "mentor_and_admin") return true;
      return false;
    });

    const enriched = await Promise.all(
      filtered.map(async (n) => {
        const mentor = await ctx.db.get(n.mentorId);
        return { ...n, mentor };
      }),
    );

    return enriched;
  },
});

export const getMyNotes = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    if (user.role !== "mentor" && user.role !== "admin") {
      return [];
    }

    const notes = await ctx.db
      .query("mentorNotes")
      .withIndex("by_mentorId", (q) => q.eq("mentorId", user._id))
      .order("desc")
      .take(100);

    const enriched = await Promise.all(
      notes.map(async (n) => {
        const beneficiary = await ctx.db.get(n.beneficiaryUserId);
        return { ...n, beneficiary };
      }),
    );

    return enriched;
  },
});

export const remove = mutation({
  args: { noteId: v.id("mentorNotes") },
  handler: async (ctx, args) => {
    const user = await requireAdminOrMentor(ctx);
    const note = await ctx.db.get(args.noteId);
    if (!note) throw new Error("Note not found.");

    if (user.role !== "admin" && note.mentorId !== user._id) {
      throw new Error("You can only delete your own notes.");
    }

    await ctx.db.delete(args.noteId);
  },
});

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireUser } from "./authHelpers";
import { notifyWithEmail } from "./emailHelpers";

export const assign = mutation({
  args: {
    mentorId: v.id("users"),
    beneficiaryUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Deactivate any existing active assignment for this beneficiary
    const existing = await ctx.db
      .query("mentorAssignments")
      .withIndex("by_beneficiaryUserId_and_isActive", (q) =>
        q.eq("beneficiaryUserId", args.beneficiaryUserId).eq("isActive", true),
      )
      .take(10);

    for (const assignment of existing) {
      await ctx.db.patch(assignment._id, {
        isActive: false,
        endedAt: Date.now(),
      });
    }

    const assignmentId = await ctx.db.insert("mentorAssignments", {
      mentorId: args.mentorId,
      beneficiaryUserId: args.beneficiaryUserId,
      isActive: true,
      assignedAt: Date.now(),
    });

    // Look up names for email templates
    const mentor = await ctx.db.get(args.mentorId);
    const beneficiary = await ctx.db.get(args.beneficiaryUserId);
    const mentorName = mentor?.name || "your mentor";
    const beneficiaryName = beneficiary?.name || "a new mentee";

    // Email the beneficiary
    await notifyWithEmail(ctx, {
      userId: args.beneficiaryUserId,
      type: "mentor_assigned",
      title: `You've been paired with ${mentorName}`,
      body: `${mentorName} has been assigned as your mentor.`,
      eventKey: `mentor_assigned:${assignmentId}`,
      linkUrl: "/beneficiary",
      emailType: "mentor-assigned",
      templateData: { mentorName },
    });

    // Email the mentor
    await notifyWithEmail(ctx, {
      userId: args.mentorId,
      type: "mentee_assigned",
      title: `New mentee assigned: ${beneficiaryName}`,
      body: `${beneficiaryName} has been assigned to you as a mentee.`,
      eventKey: `mentee_assigned:${assignmentId}`,
      linkUrl: "/mentor/mentees",
      emailType: "mentee-assigned",
      templateData: { menteeName: beneficiaryName },
    });

    return assignmentId;
  },
});

export const endAssignment = mutation({
  args: { assignmentId: v.id("mentorAssignments") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) throw new Error("Assignment not found.");

    await ctx.db.patch(args.assignmentId, {
      isActive: false,
      endedAt: Date.now(),
    });
    return args.assignmentId;
  },
});

export const getActiveMentor = query({
  args: { beneficiaryUserId: v.id("users") },
  handler: async (ctx, args) => {
    await requireUser(ctx);

    const assignment = await ctx.db
      .query("mentorAssignments")
      .withIndex("by_beneficiaryUserId_and_isActive", (q) =>
        q
          .eq("beneficiaryUserId", args.beneficiaryUserId)
          .eq("isActive", true),
      )
      .take(1);

    if (assignment.length === 0) return null;

    const mentor = await ctx.db.get(assignment[0].mentorId);
    return { assignment: assignment[0], mentor };
  },
});

export const getAssignmentHistory = query({
  args: { beneficiaryUserId: v.id("users") },
  handler: async (ctx, args) => {
    await requireUser(ctx);

    const assignments = await ctx.db
      .query("mentorAssignments")
      .withIndex("by_beneficiaryUserId", (q) =>
        q.eq("beneficiaryUserId", args.beneficiaryUserId),
      )
      .take(50);

    const enriched = await Promise.all(
      assignments.map(async (a) => {
        const mentor = await ctx.db.get(a.mentorId);
        return { ...a, mentor };
      }),
    );

    return enriched;
  },
});

export const getMyMentees = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    if (user.role !== "mentor" && user.role !== "admin") {
      throw new Error("Only mentors can view their mentees.");
    }

    const assignments = await ctx.db
      .query("mentorAssignments")
      .withIndex("by_mentorId_and_isActive", (q) =>
        q.eq("mentorId", user._id).eq("isActive", true),
      )
      .take(50);

    const mentees = await Promise.all(
      assignments.map(async (a) => {
        const beneficiary = await ctx.db.get(a.beneficiaryUserId);
        return { assignment: a, beneficiary };
      }),
    );

    return mentees;
  },
});

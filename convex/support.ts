import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser, requireAdmin } from "./authHelpers";

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ["submitted"],
  submitted: ["under_review", "declined"],
  under_review: ["approved", "declined"],
  approved: ["disbursed"],
  disbursed: ["evidence_requested", "verified", "closed"],
  evidence_requested: ["evidence_submitted"],
  evidence_submitted: ["verified", "evidence_requested"],
  verified: ["closed"],
  declined: [],
  closed: [],
};

const categoryValidator = v.union(
  v.literal("tuition"),
  v.literal("books"),
  v.literal("transport"),
  v.literal("medical"),
  v.literal("accommodation"),
  v.literal("other"),
);

const statusValidator = v.union(
  v.literal("draft"),
  v.literal("submitted"),
  v.literal("under_review"),
  v.literal("approved"),
  v.literal("declined"),
  v.literal("disbursed"),
  v.literal("evidence_requested"),
  v.literal("evidence_submitted"),
  v.literal("verified"),
  v.literal("closed"),
);

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: categoryValidator,
    amountRequested: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    return await ctx.db.insert("supportRequests", {
      beneficiaryUserId: user._id,
      title: args.title,
      description: args.description,
      category: args.category,
      amountRequested: args.amountRequested,
      status: "submitted",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const transition = mutation({
  args: {
    requestId: v.id("supportRequests"),
    toStatus: statusValidator,
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found.");

    // Beneficiaries can only submit evidence
    if (user.role === "beneficiary") {
      if (request.beneficiaryUserId !== user._id) {
        throw new Error("You can only manage your own requests.");
      }
      if (args.toStatus !== "evidence_submitted" && args.toStatus !== "submitted") {
        throw new Error("You can only submit or upload evidence for your requests.");
      }
    } else if (user.role !== "admin") {
      throw new Error("Only admins and beneficiaries can manage support requests.");
    }

    const allowed = VALID_TRANSITIONS[request.status] || [];
    if (!allowed.includes(args.toStatus)) {
      throw new Error(
        `Invalid transition from "${request.status}" to "${args.toStatus}". Allowed: ${allowed.join(", ") || "none"}.`,
      );
    }

    // Record event
    await ctx.db.insert("supportRequestEvents", {
      requestId: args.requestId,
      action: `${request.status} → ${args.toStatus}`,
      fromStatus: request.status,
      toStatus: args.toStatus,
      performedBy: user._id,
      note: args.note,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.requestId, {
      status: args.toStatus,
      updatedAt: Date.now(),
    });

    return args.requestId;
  },
});

export const getMyRequests = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    return await ctx.db
      .query("supportRequests")
      .withIndex("by_beneficiaryUserId", (q) => q.eq("beneficiaryUserId", user._id))
      .take(100);
  },
});

export const getById = query({
  args: { requestId: v.id("supportRequests") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const request = await ctx.db.get(args.requestId);
    if (!request) return null;

    if (user.role !== "admin" && request.beneficiaryUserId !== user._id) {
      throw new Error("Unauthorized.");
    }

    const events = await ctx.db
      .query("supportRequestEvents")
      .withIndex("by_requestId", (q) => q.eq("requestId", args.requestId))
      .take(100);

    const disbursements = await ctx.db
      .query("disbursements")
      .withIndex("by_requestId", (q) => q.eq("requestId", args.requestId))
      .take(50);

    const beneficiary = await ctx.db.get(request.beneficiaryUserId);

    return { ...request, events, disbursements, beneficiary };
  },
});

export const listAll = query({
  args: { status: v.optional(statusValidator) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.status) {
      return await ctx.db.query("supportRequests").withIndex("by_status", (q) => q.eq("status", args.status!)).take(200);
    }
    return await ctx.db.query("supportRequests").take(200);
  },
});

export const listWithBeneficiaries = query({
  args: { status: v.optional(statusValidator) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    let requests;
    if (args.status) {
      requests = await ctx.db.query("supportRequests").withIndex("by_status", (q) => q.eq("status", args.status!)).take(200);
    } else {
      requests = await ctx.db.query("supportRequests").take(200);
    }

    const enriched = await Promise.all(
      requests.map(async (r) => {
        const beneficiary = await ctx.db.get(r.beneficiaryUserId);
        return { ...r, beneficiary };
      }),
    );
    return enriched;
  },
});

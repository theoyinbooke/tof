import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser, requireAdmin } from "./authHelpers";
import { notifyWithEmail, notifyAdminsWithEmail, formatNaira } from "./emailHelpers";

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
  v.literal("upkeep"),
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

const SUPPORT_CATEGORY_LABELS: Record<string, string> = {
  tuition: "Tuition",
  books: "Books",
  transport: "Transport",
  medical: "Medical",
  accommodation: "Accommodation",
  upkeep: "Upkeep",
  other: "Other",
};

function deriveSupportTitle(args: {
  title?: string;
  category: string;
  description: string;
}) {
  const explicitTitle = args.title?.trim();
  if (explicitTitle) return explicitTitle;

  const categoryLabel = SUPPORT_CATEGORY_LABELS[args.category] ?? "Support";
  const condensedDescription = args.description.trim().replace(/\s+/g, " ");
  if (!condensedDescription) {
    return `${categoryLabel} support`;
  }

  const preview =
    condensedDescription.length > 48
      ? `${condensedDescription.slice(0, 48).trimEnd()}...`
      : condensedDescription;
  return `${categoryLabel}: ${preview}`;
}

export const create = mutation({
  args: {
    title: v.optional(v.string()),
    description: v.string(),
    category: categoryValidator,
    amountRequested: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const title = deriveSupportTitle(args);
    const requestId = await ctx.db.insert("supportRequests", {
      beneficiaryUserId: user._id,
      title,
      description: args.description,
      category: args.category,
      amountRequested: args.amountRequested,
      status: "submitted",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Email beneficiary confirmation
    await notifyWithEmail(ctx, {
      userId: user._id,
      type: "support_request_received",
      title: "Support request submitted",
      body: `Your request "${title}" has been submitted.`,
      eventKey: `support_received:${requestId}`,
      linkUrl: `/beneficiary/support/${requestId}`,
      emailType: "support-request-received",
      templateData: {
        recipientName: user.name,
        requestTitle: title,
        requestCategory: args.category,
        requestAmount: args.amountRequested ? formatNaira(args.amountRequested) : "",
      },
    });

    // Email admins about new request
    await notifyAdminsWithEmail(ctx, {
      type: "support_request_admin",
      title: `New support request from ${user.name}`,
      body: `${user.name} submitted a support request: "${title}".`,
      eventKeyPrefix: `support_admin:${requestId}`,
      linkUrl: `/admin/support/${requestId}`,
      emailType: "support-request-admin",
      templateData: {
        beneficiaryName: user.name,
        requestTitle: title,
        requestCategory: args.category,
        requestAmount: args.amountRequested ? formatNaira(args.amountRequested) : "",
        ctaUrl: `/admin/support/${requestId}`,
      },
    });

    return requestId;
  },
});

export const createForBeneficiary = mutation({
  args: {
    beneficiaryUserId: v.id("users"),
    title: v.optional(v.string()),
    description: v.string(),
    category: categoryValidator,
    amountRequested: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const beneficiary = await ctx.db.get(args.beneficiaryUserId);
    if (!beneficiary) {
      throw new Error("Beneficiary not found.");
    }
    if (beneficiary.role !== "beneficiary") {
      throw new Error("Support requests can only be assigned to beneficiaries.");
    }
    const title = deriveSupportTitle(args);

    const requestId = await ctx.db.insert("supportRequests", {
      beneficiaryUserId: beneficiary._id,
      title,
      description: args.description,
      category: args.category,
      amountRequested: args.amountRequested,
      status: "submitted",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("supportRequestEvents", {
      requestId,
      action: "support request created by admin",
      fromStatus: "draft",
      toStatus: "submitted",
      performedBy: admin._id,
      note: `Created by admin ${admin.name} for ${beneficiary.name}.`,
      createdAt: Date.now(),
    });

    await notifyWithEmail(ctx, {
      userId: beneficiary._id,
      type: "support_request_created_for_you",
      title: "A support request has been created for you",
      body: `A support request titled "${title}" has been created on your behalf.`,
      eventKey: `support_created_for_you:${requestId}`,
      linkUrl: `/beneficiary/support/${requestId}`,
      emailType: "support-request-received",
      templateData: {
        recipientName: beneficiary.name,
        requestTitle: title,
        requestCategory: args.category,
        requestAmount: args.amountRequested
          ? formatNaira(args.amountRequested)
          : "",
      },
    });

    return requestId;
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

    // ─── Email notifications for status transitions ───
    const beneficiary = await ctx.db.get(request.beneficiaryUserId);
    const beneficiaryName = beneficiary?.name || "Beneficiary";

    const emailMap: Record<string, { emailType: string; title: string; body: string }> = {
      under_review: {
        emailType: "request-under-review",
        title: `Under review: ${request.title}`,
        body: `Your request "${request.title}" is now being reviewed.`,
      },
      approved: {
        emailType: "request-approved",
        title: `Approved: ${request.title}`,
        body: `Your request "${request.title}" has been approved.`,
      },
      declined: {
        emailType: "request-declined",
        title: `Declined: ${request.title}`,
        body: `Your request "${request.title}" has been declined.`,
      },
      evidence_requested: {
        emailType: "evidence-requested",
        title: "Evidence required",
        body: `Please submit evidence for your disbursement.`,
      },
    };

    const emailConfig = emailMap[args.toStatus];
    if (emailConfig && request.beneficiaryUserId !== user._id) {
      await notifyWithEmail(ctx, {
        userId: request.beneficiaryUserId,
        type: `support_${args.toStatus}`,
        title: emailConfig.title,
        body: emailConfig.body,
        eventKey: `support_${args.toStatus}:${args.requestId}:${Date.now()}`,
        linkUrl: `/beneficiary/support/${args.requestId}`,
        emailType: emailConfig.emailType,
        templateData: {
          recipientName: beneficiaryName,
          requestTitle: request.title,
          requestCategory: request.category,
          requestAmount: request.amountRequested ? formatNaira(request.amountRequested) : "",
          declineReason: args.note || "",
        },
      });
    }

    // Notify admins when beneficiary submits evidence
    if (args.toStatus === "evidence_submitted" && user.role === "beneficiary") {
      await notifyAdminsWithEmail(ctx, {
        type: "evidence_submitted_admin",
        title: `Evidence submitted by ${beneficiaryName}`,
        body: `${beneficiaryName} submitted evidence for their disbursement.`,
        eventKeyPrefix: `evidence_submitted:${args.requestId}:${Date.now()}`,
        linkUrl: `/admin/support/${args.requestId}`,
        emailType: "evidence-submitted",
        templateData: {
          beneficiaryName,
          ctaUrl: `/admin/support/${args.requestId}`,
        },
      });
    }

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

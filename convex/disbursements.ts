import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireUser } from "./authHelpers";
import { notifyWithEmail, formatNaira, formatDate } from "./emailHelpers";

export const create = mutation({
  args: {
    requestId: v.id("supportRequests"),
    amount: v.number(),
    bankReference: v.optional(v.string()),
    transferDate: v.optional(v.number()),
    evidenceDueDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Support request not found.");
    if (request.status !== "approved") {
      throw new Error("Can only disburse for approved requests.");
    }

    const disbursementId = await ctx.db.insert("disbursements", {
      requestId: args.requestId,
      amount: args.amount,
      bankReference: args.bankReference,
      transferDate: args.transferDate || Date.now(),
      disbursedBy: admin._id,
      evidenceDueDate: args.evidenceDueDate,
      evidenceStatus: args.evidenceDueDate ? "pending" : "not_required",
      notes: args.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Transition request to disbursed
    await ctx.db.insert("supportRequestEvents", {
      requestId: args.requestId,
      action: "approved → disbursed",
      fromStatus: "approved",
      toStatus: "disbursed",
      performedBy: admin._id,
      note: `Disbursed ₦${args.amount.toLocaleString()}`,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.requestId, {
      status: "disbursed",
      updatedAt: Date.now(),
    });

    // Email beneficiary about disbursement
    await notifyWithEmail(ctx, {
      userId: request.beneficiaryUserId,
      type: "disbursement_created",
      title: `Disbursement of \u20A6${formatNaira(args.amount)} created`,
      body: `A disbursement of \u20A6${formatNaira(args.amount)} has been created for your request.`,
      eventKey: `disbursement_created:${disbursementId}`,
      linkUrl: `/beneficiary/support/${args.requestId}`,
      emailType: "disbursement-created",
      templateData: {
        disbursementAmount: formatNaira(args.amount),
        bankReference: args.bankReference || "N/A",
        evidenceDueDate: args.evidenceDueDate ? formatDate(args.evidenceDueDate) : "N/A",
      },
    });

    return disbursementId;
  },
});

export const submitEvidence = mutation({
  args: {
    disbursementId: v.id("disbursements"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const disbursement = await ctx.db.get(args.disbursementId);
    if (!disbursement) throw new Error("Disbursement not found.");

    const request = await ctx.db.get(disbursement.requestId);
    if (!request) throw new Error("Request not found.");

    if (user.role !== "admin" && request.beneficiaryUserId !== user._id) {
      throw new Error("You can only submit evidence for your own disbursements.");
    }

    if (
      disbursement.evidenceStatus !== "pending" &&
      disbursement.evidenceStatus !== "overdue"
    ) {
      throw new Error("Evidence not expected for this disbursement.");
    }

    await ctx.db.patch(args.disbursementId, {
      evidenceStorageId: args.storageId,
      evidenceStatus: "submitted",
      updatedAt: Date.now(),
    });

    // Transition request to evidence_submitted if currently evidence_requested or disbursed
    if (request.status === "evidence_requested" || request.status === "disbursed") {
      await ctx.db.insert("supportRequestEvents", {
        requestId: request._id,
        action: `${request.status} → evidence_submitted`,
        fromStatus: request.status,
        toStatus: "evidence_submitted",
        performedBy: user._id,
        createdAt: Date.now(),
      });
      await ctx.db.patch(request._id, {
        status: "evidence_submitted",
        updatedAt: Date.now(),
      });
    }

    return args.disbursementId;
  },
});

export const verifyEvidence = mutation({
  args: {
    disbursementId: v.id("disbursements"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const disbursement = await ctx.db.get(args.disbursementId);
    if (!disbursement) throw new Error("Disbursement not found.");

    if (disbursement.evidenceStatus !== "submitted") {
      throw new Error("No evidence to verify.");
    }

    await ctx.db.patch(args.disbursementId, {
      evidenceStatus: "verified",
      notes: args.notes || disbursement.notes,
      updatedAt: Date.now(),
    });

    // Transition request to verified
    const request = await ctx.db.get(disbursement.requestId);
    if (request && request.status === "evidence_submitted") {
      await ctx.db.insert("supportRequestEvents", {
        requestId: request._id,
        action: "evidence_submitted → verified",
        fromStatus: "evidence_submitted",
        toStatus: "verified",
        performedBy: admin._id,
        note: args.notes,
        createdAt: Date.now(),
      });
      await ctx.db.patch(request._id, {
        status: "verified",
        updatedAt: Date.now(),
      });

      // Email beneficiary about verification
      await notifyWithEmail(ctx, {
        userId: request.beneficiaryUserId,
        type: "evidence_verified",
        title: "Your evidence has been verified",
        body: `The evidence for your disbursement of \u20A6${formatNaira(disbursement.amount)} has been verified.`,
        eventKey: `evidence_verified:${args.disbursementId}`,
        linkUrl: `/beneficiary/support/${request._id}`,
        emailType: "evidence-verified",
        templateData: {
          disbursementAmount: formatNaira(disbursement.amount),
        },
      });
    }

    return args.disbursementId;
  },
});

export const listByRequest = query({
  args: { requestId: v.id("supportRequests") },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    return await ctx.db
      .query("disbursements")
      .withIndex("by_requestId", (q) => q.eq("requestId", args.requestId))
      .take(50);
  },
});

export const listOverdue = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const pending = await ctx.db
      .query("disbursements")
      .withIndex("by_evidenceStatus", (q) => q.eq("evidenceStatus", "pending"))
      .take(200);

    const overdue = pending.filter(
      (d) => d.evidenceDueDate && d.evidenceDueDate < Date.now(),
    );

    const enriched = await Promise.all(
      overdue.map(async (d) => {
        const request = await ctx.db.get(d.requestId);
        const beneficiary = request ? await ctx.db.get(request.beneficiaryUserId) : null;
        return { ...d, request, beneficiary };
      }),
    );

    return enriched;
  },
});

export const financialSummary = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const disbursements = await ctx.db.query("disbursements").take(1000);

    const totalDisbursed = disbursements.reduce((sum, d) => sum + d.amount, 0);
    const pendingEvidence = disbursements.filter((d) => d.evidenceStatus === "pending").length;
    const overdueEvidence = disbursements.filter(
      (d) => d.evidenceStatus === "pending" && d.evidenceDueDate && d.evidenceDueDate < Date.now(),
    ).length;
    const verified = disbursements.filter((d) => d.evidenceStatus === "verified").length;

    const pendingRequests = await ctx.db
      .query("supportRequests")
      .withIndex("by_status", (q) => q.eq("status", "submitted"))
      .take(200);

    const underReview = await ctx.db
      .query("supportRequests")
      .withIndex("by_status", (q) => q.eq("status", "under_review"))
      .take(200);

    const operationalExpenses = await ctx.db
      .query("operationalExpenses")
      .take(2000);
    const totalOperationalExpenses = operationalExpenses.reduce(
      (sum, e) => sum + e.amount,
      0,
    );

    return {
      totalDisbursed,
      disbursementCount: disbursements.length,
      pendingEvidence,
      overdueEvidence,
      verified,
      pendingRequests: pendingRequests.length,
      underReview: underReview.length,
      totalOperationalExpenses,
      operationalExpenseCount: operationalExpenses.length,
      totalPlatformExpenses: totalDisbursed + totalOperationalExpenses,
    };
  },
});

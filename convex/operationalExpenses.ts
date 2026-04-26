import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { requireAdmin } from "./authHelpers";
import { logAuditEvent } from "./auditLogs";

const categoryValidator = v.union(
  v.literal("school_fees"),
  v.literal("supplies"),
  v.literal("transport"),
  v.literal("utilities"),
  v.literal("salaries"),
  v.literal("events"),
  v.literal("equipment"),
  v.literal("rent"),
  v.literal("other"),
);

export const create = mutation({
  args: {
    category: categoryValidator,
    amount: v.number(),
    description: v.string(),
    expenseDate: v.optional(v.number()),
    payee: v.optional(v.string()),
    beneficiaryName: v.optional(v.string()),
    bankReference: v.optional(v.string()),
    receiptStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    if (args.amount <= 0) {
      throw new Error("Amount must be greater than zero.");
    }
    if (!args.description.trim()) {
      throw new Error("Description is required.");
    }

    const now = Date.now();
    const expenseId = await ctx.db.insert("operationalExpenses", {
      category: args.category,
      amount: args.amount,
      description: args.description.trim(),
      expenseDate: args.expenseDate ?? now,
      payee: args.payee?.trim() || undefined,
      beneficiaryName: args.beneficiaryName?.trim() || undefined,
      bankReference: args.bankReference?.trim() || undefined,
      receiptStorageId: args.receiptStorageId,
      recordedBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    await logAuditEvent(ctx, {
      userId: admin._id,
      action: "create_operational_expense",
      resource: "operationalExpenses",
      resourceId: expenseId,
      details: `Recorded ₦${args.amount.toLocaleString()} ${args.category} expense: ${args.description.slice(0, 80)}`,
    });

    return expenseId;
  },
});

export const update = mutation({
  args: {
    expenseId: v.id("operationalExpenses"),
    category: v.optional(categoryValidator),
    amount: v.optional(v.number()),
    description: v.optional(v.string()),
    expenseDate: v.optional(v.number()),
    payee: v.optional(v.string()),
    beneficiaryName: v.optional(v.string()),
    bankReference: v.optional(v.string()),
    receiptStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const expense = await ctx.db.get(args.expenseId);
    if (!expense) throw new Error("Operational expense not found.");

    const patch: Partial<Doc<"operationalExpenses">> & { updatedAt: number } = {
      updatedAt: Date.now(),
    };
    if (args.category !== undefined) patch.category = args.category;
    if (args.amount !== undefined) {
      if (args.amount <= 0) throw new Error("Amount must be greater than zero.");
      patch.amount = args.amount;
    }
    if (args.description !== undefined) {
      const trimmed = args.description.trim();
      if (!trimmed) throw new Error("Description is required.");
      patch.description = trimmed;
    }
    if (args.expenseDate !== undefined) patch.expenseDate = args.expenseDate;
    if (args.payee !== undefined) patch.payee = args.payee.trim() || undefined;
    if (args.beneficiaryName !== undefined)
      patch.beneficiaryName = args.beneficiaryName.trim() || undefined;
    if (args.bankReference !== undefined)
      patch.bankReference = args.bankReference.trim() || undefined;
    if (args.receiptStorageId !== undefined)
      patch.receiptStorageId = args.receiptStorageId;

    await ctx.db.patch(args.expenseId, patch);

    await logAuditEvent(ctx, {
      userId: admin._id,
      action: "update_operational_expense",
      resource: "operationalExpenses",
      resourceId: args.expenseId,
      details: `Updated operational expense ${expense.description.slice(0, 60)}`,
    });

    return args.expenseId;
  },
});

export const remove = mutation({
  args: { expenseId: v.id("operationalExpenses") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const expense = await ctx.db.get(args.expenseId);
    if (!expense) throw new Error("Operational expense not found.");

    await ctx.db.delete(args.expenseId);

    await logAuditEvent(ctx, {
      userId: admin._id,
      action: "delete_operational_expense",
      resource: "operationalExpenses",
      resourceId: args.expenseId,
      details: `Deleted operational expense ₦${expense.amount.toLocaleString()} ${expense.category}: ${expense.description.slice(0, 60)}`,
    });

    return args.expenseId;
  },
});

export const list = query({
  args: {
    category: v.optional(categoryValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const limit = args.limit ?? 100;

    const expenses = args.category
      ? await ctx.db
          .query("operationalExpenses")
          .withIndex("by_category", (q) => q.eq("category", args.category!))
          .order("desc")
          .take(limit)
      : await ctx.db
          .query("operationalExpenses")
          .withIndex("by_expenseDate")
          .order("desc")
          .take(limit);

    const enriched = await Promise.all(
      expenses.map(async (e) => {
        const recorder = await ctx.db.get(e.recordedBy);
        const receiptUrl = e.receiptStorageId
          ? await ctx.storage.getUrl(e.receiptStorageId)
          : null;
        return {
          ...e,
          recorderName: recorder?.name ?? "Unknown",
          receiptUrl,
        };
      }),
    );

    return enriched;
  },
});

export const summary = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const expenses = await ctx.db.query("operationalExpenses").take(2000);

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const byCategory: Record<string, { count: number; total: number }> = {};
    for (const e of expenses) {
      const slot = byCategory[e.category] ?? { count: 0, total: 0 };
      slot.count += 1;
      slot.total += e.amount;
      byCategory[e.category] = slot;
    }

    return {
      totalAmount,
      count: expenses.length,
      byCategory,
    };
  },
});

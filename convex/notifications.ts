import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { requireUser, requireAdmin } from "./authHelpers";
import { Id } from "./_generated/dataModel";
import { MutationCtx } from "./_generated/server";

// ─── Helper: Create notification with deduplication ───

export async function createNotification(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    type: string;
    title: string;
    body: string;
    eventKey: string;
    linkUrl?: string;
  },
) {
  // Deduplicate by eventKey
  const existing = await ctx.db
    .query("notifications")
    .withIndex("by_eventKey", (q) => q.eq("eventKey", args.eventKey))
    .take(1);

  if (existing.length > 0) {
    return existing[0]._id;
  }

  const notificationId = await ctx.db.insert("notifications", {
    userId: args.userId,
    type: args.type,
    title: args.title,
    body: args.body,
    eventKey: args.eventKey,
    linkUrl: args.linkUrl,
    isRead: false,
    createdAt: Date.now(),
  });

  // Create in-app delivery record
  await ctx.db.insert("notificationDeliveries", {
    notificationId,
    userId: args.userId,
    channel: "in_app",
    status: "sent",
    eventKey: args.eventKey,
    attemptCount: 1,
    lastAttemptAt: Date.now(),
    createdAt: Date.now(),
  });

  return notificationId;
}

// ─── Queries ───

export const getMyNotifications = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    return await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_and_isRead", (q) =>
        q.eq("userId", user._id).eq("isRead", false),
      )
      .take(200);
    return unread.length;
  },
});

// ─── Mutations ───

export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) throw new Error("Notification not found.");
    if (notification.userId !== user._id) throw new Error("Unauthorized.");

    await ctx.db.patch(args.notificationId, { isRead: true });
    return args.notificationId;
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_and_isRead", (q) =>
        q.eq("userId", user._id).eq("isRead", false),
      )
      .take(200);

    for (const n of unread) {
      await ctx.db.patch(n._id, { isRead: true });
    }
    return unread.length;
  },
});

export const send = mutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    eventKey: v.string(),
    linkUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await createNotification(ctx, args);
  },
});

// ─── Admin queries ───

export const listDeliveries = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("sent"),
        v.literal("failed"),
        v.literal("skipped"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.status) {
      return await ctx.db
        .query("notificationDeliveries")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .take(200);
    }
    return await ctx.db.query("notificationDeliveries").take(200);
  },
});

// ─── Scheduled Jobs (Internal Mutations) ───

export const sendSessionReminders = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayFromNow = now + 24 * 60 * 60 * 1000;

    // Find upcoming sessions within 24 hours
    const upcomingSessions = await ctx.db
      .query("sessions")
      .withIndex("by_status", (q) => q.eq("status", "upcoming"))
      .take(50);

    const soon = upcomingSessions.filter(
      (s) => s.scheduledDate && s.scheduledDate > now && s.scheduledDate < oneDayFromNow,
    );

    for (const session of soon) {
      // Get enrolled users
      const enrollments = await ctx.db
        .query("sessionEnrollments")
        .withIndex("by_sessionId_and_status", (q) =>
          q.eq("sessionId", session._id).eq("status", "enrolled"),
        )
        .take(200);

      for (const enrollment of enrollments) {
        const eventKey = `session_reminder:${session._id}:${enrollment.userId}`;
        await createNotification(ctx, {
          userId: enrollment.userId,
          type: "session_reminder",
          title: "Upcoming Session",
          body: `Session "${session.title}" is scheduled for tomorrow.`,
          eventKey,
          linkUrl: "/beneficiary/sessions",
        });
      }
    }
  },
});

export const sendEvidenceOverdueNotifications = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const pending = await ctx.db
      .query("disbursements")
      .withIndex("by_evidenceStatus", (q) => q.eq("evidenceStatus", "pending"))
      .take(200);

    const overdue = pending.filter(
      (d) => d.evidenceDueDate && d.evidenceDueDate < now,
    );

    for (const disbursement of overdue) {
      // Mark as overdue
      await ctx.db.patch(disbursement._id, {
        evidenceStatus: "overdue",
        updatedAt: now,
      });

      const request = await ctx.db.get(disbursement.requestId);
      if (!request) continue;

      const eventKey = `evidence_overdue:${disbursement._id}`;
      await createNotification(ctx, {
        userId: request.beneficiaryUserId,
        type: "evidence_overdue",
        title: "Evidence Overdue",
        body: `Evidence for your disbursement of ₦${disbursement.amount.toLocaleString()} is overdue.`,
        eventKey,
        linkUrl: `/beneficiary/support/${request._id}`,
      });

      // Notify admins
      const admins = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", "admin"))
        .take(20);

      for (const admin of admins) {
        const adminEventKey = `evidence_overdue_admin:${disbursement._id}:${admin._id}`;
        await createNotification(ctx, {
          userId: admin._id,
          type: "evidence_overdue_admin",
          title: "Evidence Overdue",
          body: `Evidence overdue for disbursement ₦${disbursement.amount.toLocaleString()}.`,
          eventKey: adminEventKey,
          linkUrl: `/admin/support/${request._id}`,
        });
      }
    }
  },
});

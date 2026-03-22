// ─── Email Scheduling Helpers ───
// Used by mutations to schedule email sends alongside in-app notifications.

import { MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * Schedule an email to be sent to a user.
 * Creates a "pending" delivery record and schedules the email action.
 */
export async function scheduleEmail(
  ctx: MutationCtx,
  args: {
    notificationId: Id<"notifications">;
    userId: Id<"users">;
    emailType: string;
    eventKey: string;
    templateData?: Record<string, string>;
  },
) {
  const user = await ctx.db.get(args.userId);
  if (!user || !user.email) return;

  // Create email delivery record
  const deliveryId = await ctx.db.insert("notificationDeliveries", {
    notificationId: args.notificationId,
    userId: args.userId,
    channel: "email",
    status: "pending",
    eventKey: `email:${args.eventKey}`,
    attemptCount: 0,
    createdAt: Date.now(),
  });

  // Schedule the email action
  await ctx.scheduler.runAfter(0, internal.email.send, {
    deliveryId,
    to: user.email,
    recipientName: user.name || "there",
    emailType: args.emailType,
    templateData: JSON.stringify(args.templateData || {}),
    eventKey: `email:${args.eventKey}`,
  });
}

/**
 * Create a notification AND schedule an email in one call.
 * Combines createNotification + scheduleEmail for convenience.
 */
export async function notifyWithEmail(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    type: string;
    title: string;
    body: string;
    eventKey: string;
    linkUrl?: string;
    emailType: string;
    templateData?: Record<string, string>;
  },
) {
  // Import createNotification dynamically to avoid circular dependency
  const { createNotification } = await import("./notifications");

  const notificationId = await createNotification(ctx, {
    userId: args.userId,
    type: args.type,
    title: args.title,
    body: args.body,
    eventKey: args.eventKey,
    linkUrl: args.linkUrl,
  });

  await scheduleEmail(ctx, {
    notificationId,
    userId: args.userId,
    emailType: args.emailType,
    eventKey: args.eventKey,
    templateData: args.templateData,
  });

  return notificationId;
}

/**
 * Send an email to all admins for a given notification.
 */
export async function notifyAdminsWithEmail(
  ctx: MutationCtx,
  args: {
    type: string;
    title: string;
    body: string;
    eventKeyPrefix: string;
    linkUrl?: string;
    emailType: string;
    templateData?: Record<string, string>;
  },
) {
  const admins = await ctx.db
    .query("users")
    .withIndex("by_role_and_isActive", (q) =>
      q.eq("role", "admin").eq("isActive", true),
    )
    .take(20);

  for (const admin of admins) {
    const eventKey = `${args.eventKeyPrefix}:${admin._id}`;
    await notifyWithEmail(ctx, {
      userId: admin._id,
      type: args.type,
      title: args.title,
      body: args.body,
      eventKey,
      linkUrl: args.linkUrl,
      emailType: args.emailType,
      templateData: {
        ...args.templateData,
        recipientName: admin.name,
      },
    });
  }
}

/**
 * Format a timestamp as a readable date string.
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-NG", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a number as Nigerian Naira.
 */
export function formatNaira(amount: number): string {
  return amount.toLocaleString("en-NG");
}

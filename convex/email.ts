// ─── Email Sending Action & Delivery Tracking ───
// Internal action that renders templates and sends via Resend API.
// Internal mutation for updating delivery status.
// Uses fetch() (available in default Convex runtime — no "use node" needed).

import { v } from "convex/values";
import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { renderTemplate } from "./emails/templates";

const FROM_ADDRESSES = {
  hello: "TheOyinbooke Foundation <send@hello.theoyinbookefoundation.com>",
  notify: "TheOyinbooke Foundation <updates@notify.theoyinbookefoundation.com>",
} as const;

// ─── Send Email Action ───

export const send = internalAction({
  args: {
    deliveryId: v.id("notificationDeliveries"),
    to: v.string(),
    recipientName: v.string(),
    emailType: v.string(),
    templateData: v.string(), // JSON-encoded Record<string, string>
    eventKey: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      await ctx.runMutation(internal.email.updateDeliveryStatus, {
        deliveryId: args.deliveryId,
        status: "failed",
        errorMessage: "RESEND_API_KEY not configured",
      });
      return;
    }

    try {
      const data: Record<string, string> = JSON.parse(args.templateData);
      data.recipientName = args.recipientName;

      const { subject, html, fromType } = renderTemplate(args.emailType, data);
      const from = FROM_ADDRESSES[fromType];

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "Idempotency-Key": args.eventKey,
        },
        body: JSON.stringify({
          from,
          to: args.to,
          subject,
          html,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        await ctx.runMutation(internal.email.updateDeliveryStatus, {
          deliveryId: args.deliveryId,
          status: "failed",
          errorMessage: `Resend API error ${response.status}: ${errorBody}`,
        });
        return;
      }

      await ctx.runMutation(internal.email.updateDeliveryStatus, {
        deliveryId: args.deliveryId,
        status: "sent",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      await ctx.runMutation(internal.email.updateDeliveryStatus, {
        deliveryId: args.deliveryId,
        status: "failed",
        errorMessage: message,
      });
    }
  },
});

// ─── Batch Send (for notifications to multiple recipients) ───

export const sendBatch = internalAction({
  args: {
    emails: v.array(
      v.object({
        deliveryId: v.id("notificationDeliveries"),
        to: v.string(),
        recipientName: v.string(),
        emailType: v.string(),
        templateData: v.string(),
        eventKey: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      for (const email of args.emails) {
        await ctx.runMutation(internal.email.updateDeliveryStatus, {
          deliveryId: email.deliveryId,
          status: "failed",
          errorMessage: "RESEND_API_KEY not configured",
        });
      }
      return;
    }

    // Send emails sequentially to respect Resend rate limits
    for (const email of args.emails) {
      try {
        const data: Record<string, string> = JSON.parse(email.templateData);
        data.recipientName = email.recipientName;

        const { subject, html, fromType } = renderTemplate(
          email.emailType,
          data,
        );
        const from = FROM_ADDRESSES[fromType];

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "Idempotency-Key": email.eventKey,
          },
          body: JSON.stringify({ from, to: email.to, subject, html }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          await ctx.runMutation(internal.email.updateDeliveryStatus, {
            deliveryId: email.deliveryId,
            status: "failed",
            errorMessage: `Resend API error ${response.status}: ${errorBody}`,
          });
        } else {
          await ctx.runMutation(internal.email.updateDeliveryStatus, {
            deliveryId: email.deliveryId,
            status: "sent",
          });
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        await ctx.runMutation(internal.email.updateDeliveryStatus, {
          deliveryId: email.deliveryId,
          status: "failed",
          errorMessage: message,
        });
      }
    }
  },
});

// ─── Update Delivery Status ───

export const updateDeliveryStatus = internalMutation({
  args: {
    deliveryId: v.id("notificationDeliveries"),
    status: v.union(v.literal("sent"), v.literal("failed")),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const delivery = await ctx.db.get(args.deliveryId);
    if (!delivery) return;

    await ctx.db.patch(args.deliveryId, {
      status: args.status,
      lastAttemptAt: Date.now(),
      attemptCount: delivery.attemptCount + 1,
      errorMessage: args.errorMessage,
    });
  },
});

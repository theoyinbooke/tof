import { Webhook } from "svix";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { internal } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 },
    );
  }

  // Verify the webhook signature
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 },
    );
  }

  const body = await req.text();

  let event: { type: string; data: Record<string, unknown> };
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as typeof event;
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the event
  if (event.type === "user.created") {
    const data = event.data;
    const clerkId = data.id as string;

    // Extract primary email
    const emailAddresses = data.email_addresses as Array<{
      id: string;
      email_address: string;
    }>;
    const primaryEmailId = data.primary_email_address_id as string;
    const primaryEmail =
      emailAddresses?.find((e) => e.id === primaryEmailId)?.email_address ??
      emailAddresses?.[0]?.email_address ??
      "";

    const firstName = (data.first_name as string) ?? "";
    const lastName = (data.last_name as string) ?? "";
    const name = [firstName, lastName].filter(Boolean).join(" ") || primaryEmail;

    const avatarUrl = (data.image_url as string) || undefined;

    // Use admin auth to call the internal mutation
    const deployKey = process.env.CONVEX_DEPLOY_KEY;
    if (!deployKey) {
      console.error("Missing CONVEX_DEPLOY_KEY for webhook handler");
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 },
      );
    }

    convex.setAdminAuth(deployKey);

    try {
      const userId = await convex.mutation(internal.users.createFromWebhook, {
        clerkId,
        email: primaryEmail,
        name,
        avatarUrl,
      });
      console.log(`Webhook: created/found Convex user ${userId} for Clerk user ${clerkId}`);
    } catch (err) {
      console.error("Failed to create user from webhook:", err);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true });
}

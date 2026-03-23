import { Webhook } from "svix";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import type {
  FunctionReference,
  FunctionReturnType,
  OptionalRestArgs,
} from "convex/server";
import { internal } from "../../../../../convex/_generated/api";

// ConvexHttpClient with admin auth can call internal functions
type AdminConvexClient = ConvexHttpClient & {
  setAdminAuth(token: string): void;
  mutation<Mutation extends FunctionReference<"mutation", "public" | "internal">>(
    mutation: Mutation,
    ...args: OptionalRestArgs<Mutation>
  ): Promise<FunctionReturnType<Mutation>>;
};

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!,
) as AdminConvexClient;

type ClerkEmailAddress = {
  id: string;
  email_address: string;
};

type ClerkWebhookEvent = {
  type: string;
  data: Record<string, unknown>;
};

function extractUserFields(data: Record<string, unknown>) {
  const clerkId = data.id as string;

  const emailAddresses = data.email_addresses as ClerkEmailAddress[] | undefined;
  const primaryEmailId = data.primary_email_address_id as string;
  const primaryEmail =
    emailAddresses?.find((e) => e.id === primaryEmailId)?.email_address ??
    emailAddresses?.[0]?.email_address ??
    "";

  const firstName = (data.first_name as string) ?? "";
  const lastName = (data.last_name as string) ?? "";
  const name = [firstName, lastName].filter(Boolean).join(" ") || primaryEmail;

  const avatarUrl = (data.image_url as string) || undefined;

  return { clerkId, email: primaryEmail, name, avatarUrl };
}

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 },
    );
  }

  const deployKey = process.env.CONVEX_DEPLOY_KEY;
  if (!deployKey) {
    console.error("Missing CONVEX_DEPLOY_KEY for webhook handler");
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

  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  convex.setAdminAuth(deployKey);

  // Handle user.created — create user in Convex
  // Handle user.updated — create if missing (failed webhook recovery) or update
  if (event.type === "user.created" || event.type === "user.updated") {
    const fields = extractUserFields(event.data);

    try {
      const userId = await convex.mutation(
        internal.users.createOrUpdateFromWebhook,
        fields,
      );
      console.log(
        `Webhook [${event.type}]: synced Convex user ${userId} for Clerk user ${fields.clerkId}`,
      );
    } catch (err) {
      console.error(`Failed to sync user from ${event.type} webhook:`, err);
      return NextResponse.json(
        { error: "Failed to sync user" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true });
}

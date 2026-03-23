import { auth } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/backend";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { internal } from "../../../../../convex/_generated/api";

type AdminConvexClient = ConvexHttpClient & {
  setAdminAuth(token: string): void;
  mutation(fn: unknown, args: unknown): Promise<unknown>;
};

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const deployKey = process.env.CONVEX_DEPLOY_KEY;
  const issuerDomain = process.env.CLERK_JWT_ISSUER_DOMAIN;

  if (!clerkSecretKey || !convexUrl || !deployKey || !issuerDomain) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 },
    );
  }

  const body = (await req.json()) as {
    firstName?: string;
    lastName?: string;
  };

  const firstName = body.firstName?.trim() || undefined;
  const lastName = body.lastName?.trim() || undefined;

  try {
    const clerk = createClerkClient({ secretKey: clerkSecretKey });
    const updatedUser = await clerk.users.updateUser(userId, {
      firstName,
      lastName,
    });

    const primaryEmail =
      updatedUser.emailAddresses.find(
        (email) => email.id === updatedUser.primaryEmailAddressId,
      )?.emailAddress ??
      updatedUser.emailAddresses[0]?.emailAddress ??
      "";

    const name =
      [updatedUser.firstName, updatedUser.lastName].filter(Boolean).join(" ") ||
      primaryEmail;

    const convex = new ConvexHttpClient(convexUrl) as AdminConvexClient;
    convex.setAdminAuth(deployKey);

    await convex.mutation(internal.users.createOrUpdateFromWebhook, {
      clerkId: updatedUser.id,
      tokenIdentifier: `${issuerDomain}|${updatedUser.id}`,
      email: primaryEmail,
      name,
      avatarUrl: updatedUser.imageUrl || undefined,
    });

    return NextResponse.json({ ok: true, name });
  } catch (error) {
    console.error("Failed to sync profile name:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to sync profile name",
      },
      { status: 500 },
    );
  }
}

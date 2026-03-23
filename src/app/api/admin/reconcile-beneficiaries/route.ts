import { auth } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/backend";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { internal } from "../../../../../convex/_generated/api";

type AdminConvexClient = ConvexHttpClient & {
  setAdminAuth(token: string): void;
  query(fn: unknown, args: unknown): Promise<unknown>;
  mutation(fn: unknown, args: unknown): Promise<unknown>;
};

async function syncClerkUsers(
  clerk: ReturnType<typeof createClerkClient>,
  convex: AdminConvexClient,
  issuerDomain: string,
) {
  let synced = 0;
  let failed = 0;
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data: users, totalCount } = await clerk.users.getUserList({
      limit,
      offset,
    });

    if (users.length === 0) break;

    for (const user of users) {
      const primaryEmail =
        user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
          ?.emailAddress ??
        user.emailAddresses[0]?.emailAddress ??
        "";
      const name =
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        primaryEmail;

      try {
        await convex.mutation(internal.users.createOrUpdateFromWebhook, {
          clerkId: user.id,
          tokenIdentifier: `${issuerDomain}|${user.id}`,
          email: primaryEmail,
          name,
          avatarUrl: user.imageUrl || undefined,
        });
        synced++;
      } catch (error) {
        failed++;
        console.error(`Failed syncing ${primaryEmail}:`, error);
      }
    }

    offset += users.length;
    if (offset >= (totalCount ?? 0)) break;
  }

  return { synced, failed };
}

export async function POST() {
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

  const convex = new ConvexHttpClient(convexUrl) as AdminConvexClient;
  convex.setAdminAuth(deployKey);

  const actor = (await convex.query(internal.users.getByClerkId, {
    clerkId: userId,
  })) as { role?: string } | null;

  if (!actor || actor.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const clerk = createClerkClient({ secretKey: clerkSecretKey });

  try {
    const syncSummary = await syncClerkUsers(clerk, convex, issuerDomain);
    const reconcileSummary = await convex.mutation(
      internal.beneficiaries.reconcileDirectory,
      { dryRun: false },
    );

    return NextResponse.json({
      ok: true,
      syncSummary,
      reconcileSummary,
    });
  } catch (error) {
    console.error("Failed to reconcile beneficiaries:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to reconcile beneficiaries",
      },
      { status: 500 },
    );
  }
}

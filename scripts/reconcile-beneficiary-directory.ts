/**
 * Sync Clerk users into Convex, then reconcile beneficiary profiles.
 *
 * Dry run:
 *   npx tsx scripts/reconcile-beneficiary-directory.ts
 *
 * Apply changes:
 *   npx tsx scripts/reconcile-beneficiary-directory.ts --apply
 */
import { loadEnvConfig } from "@next/env";
import { createClerkClient } from "@clerk/backend";
import { ConvexHttpClient } from "convex/browser";
import { internal } from "../convex/_generated/api";

loadEnvConfig(process.cwd());

type AdminConvexClient = ConvexHttpClient & {
  setAdminAuth(token: string): void;
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

    if (offset === 0) {
      console.log(`Found ${totalCount} total users in Clerk`);
    }

    if (users.length === 0) break;

    for (const user of users) {
      const clerkId = user.id;
      const primaryEmail =
        user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
          ?.emailAddress ??
        user.emailAddresses[0]?.emailAddress ??
        "";
      const name =
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        primaryEmail;
      const avatarUrl = user.imageUrl || undefined;
      const tokenIdentifier = `${issuerDomain}|${clerkId}`;

      try {
        await convex.mutation(internal.users.createOrUpdateFromWebhook, {
          clerkId,
          tokenIdentifier,
          email: primaryEmail,
          name,
          avatarUrl,
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

async function main() {
  const apply = process.argv.includes("--apply");
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const deployKey = process.env.CONVEX_DEPLOY_KEY;
  const issuerDomain = process.env.CLERK_JWT_ISSUER_DOMAIN;

  if (!clerkSecretKey || !convexUrl || !deployKey || !issuerDomain) {
    console.error("Missing required env vars. Check .env.local has:");
    console.error(
      "  CLERK_SECRET_KEY, NEXT_PUBLIC_CONVEX_URL, CONVEX_DEPLOY_KEY, CLERK_JWT_ISSUER_DOMAIN",
    );
    process.exit(1);
  }

  const clerk = createClerkClient({ secretKey: clerkSecretKey });
  const convex = new ConvexHttpClient(convexUrl) as AdminConvexClient;
  convex.setAdminAuth(deployKey);

  console.log(
    apply
      ? "Applying Clerk sync and beneficiary reconciliation..."
      : "Running Clerk sync and beneficiary reconciliation in dry-run mode...",
  );

  const syncSummary = await syncClerkUsers(clerk, convex, issuerDomain);
  const reconcileSummary = await convex.mutation(
    internal.beneficiaries.reconcileDirectory,
    { dryRun: !apply },
  );

  console.log("\nClerk sync summary");
  console.log(JSON.stringify(syncSummary, null, 2));

  console.log("\nBeneficiary reconciliation summary");
  console.log(JSON.stringify(reconcileSummary, null, 2));

  if (!apply) {
    console.log(
      "\nDry run only. Re-run with --apply to create missing profiles and remove invalid admin/facilitator profiles.",
    );
  }
}

main().catch((error) => {
  console.error("Reconciliation failed:", error);
  process.exit(1);
});

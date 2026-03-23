/**
 * One-time script to sync all Clerk users to Convex.
 * Run with: npx tsx scripts/sync-clerk-users.ts
 */
import { loadEnvConfig } from "@next/env";
import { createClerkClient } from "@clerk/backend";
import { ConvexHttpClient } from "convex/browser";
import { internal } from "../convex/_generated/api";

loadEnvConfig(process.cwd());

type AdminConvexClient = ConvexHttpClient & {
  setAdminAuth(token: string): void;
  mutation(fn: any, args: any): Promise<any>;
};

async function main() {
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

  console.log("Fetching users from Clerk...");

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
        const userId = await convex.mutation(
          internal.users.createOrUpdateFromWebhook,
          {
            clerkId,
            tokenIdentifier,
            email: primaryEmail,
            name,
            avatarUrl,
          },
        );
        synced++;
        console.log(
          `  [${synced}] Synced: ${name} (${primaryEmail}) → ${userId}`,
        );
      } catch (err) {
        failed++;
        console.error(`  FAILED: ${name} (${primaryEmail}):`, err);
      }
    }

    offset += users.length;
    if (offset >= (totalCount ?? 0)) break;
  }

  console.log(`\nDone! Synced: ${synced}, Failed: ${failed}`);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});

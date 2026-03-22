const requiredServerEnv = [
  "CLERK_SECRET_KEY",
  "CLERK_JWT_ISSUER_DOMAIN",
] as const;

const requiredPublicEnv = [
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_CONVEX_URL",
] as const;

export function validateEnv() {
  const missing: string[] = [];

  for (const key of requiredServerEnv) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  for (const key of requiredPublicEnv) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join("\n")}\n\nCopy .env.example to .env.local and fill in the values.`,
    );
  }
}

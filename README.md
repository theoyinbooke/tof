## Minimal Scaffold

This repo now has the smallest useful scaffold for:

- Next.js App Router
- Clerk authentication
- Convex client wiring
- A public landing page and protected dashboard

## What It Does

- `/` shows a landing page with `Get Started` and `Sign In`
- successful Clerk auth redirects to `/dashboard`
- `/dashboard` is protected by Clerk middleware
- Convex is wired through a shared provider and auth config

## Setup

1. Copy the env template.

```bash
cp .env.example .env.local
```

2. Add your Clerk keys to `.env.local`.

3. In Clerk, create a JWT template named `convex`.

4. Set `CLERK_JWT_ISSUER_DOMAIN` in `.env.local`.
   It should be your Clerk issuer domain, for example `https://your-clerk-domain.clerk.accounts.dev`.

5. In terminal one, start Convex and follow the login/project prompts:

```bash
npx convex dev
```

6. Copy the generated Convex URL into `NEXT_PUBLIC_CONVEX_URL` in `.env.local`.

7. In terminal two, start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

Keep both processes running:

- `npx convex dev`
- `npm run dev`

## First Checkpoint

You are done with the initial scaffold when this path works:

1. Open `/`
2. Click `Get Started` or `Sign In`
3. Complete Clerk authentication
4. Land on `/dashboard`

Once that works, the platform can be expanded incrementally instead of trying to solve the full app upfront.

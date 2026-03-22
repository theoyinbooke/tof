# Ralph Loop: TheOyinbooke Foundation Platform Builder

You are building the TheOyinbooke Foundation platform. Each iteration you must advance the project by completing the next uncompleted task.

## How Each Iteration Works

1. **Read progress** — Check `IMPLEMENTATION_PLAN.md` for unchecked `- [ ]` items. Phases are numbered 0–14. Work in order.
2. **Read guidelines** — Before writing Convex code, read `convex/_generated/ai/guidelines.md`. Before writing UI, read `DESIGN_SYSTEM.md`.
3. **Identify the next task** — Find the FIRST unchecked `- [ ]` item in the LOWEST numbered incomplete phase.
4. **Implement it** — Write the code. Follow the rules below.
5. **Verify it** — Run `npm run lint` and `npm run build`. Fix any errors before marking done.
6. **Mark it done** — Change `- [ ]` to `- [x]` in `IMPLEMENTATION_PLAN.md` for the task you completed.
7. **Check completion** — If ALL tasks across ALL phases (0–14) plus ALL cross-cutting checklists (10.1–10.5) are `- [x]`, output `<promise>ALL PHASES COMPLETE</promise>`. Otherwise, stop and let the next iteration pick up.

## Rules

### General
- Work on ONE task per iteration (or a small logically grouped set if they are trivially connected).
- Always run `npm run lint` and `npm run build` after changes. Fix errors before marking done.
- Never leave placeholder implementations. Every function must work end-to-end.
- Do not create documentation files unless the task specifically requires it.

### Convex
- Always read `convex/_generated/ai/guidelines.md` before writing Convex functions.
- Schema goes in `convex/schema.ts`.
- Use `v` validators from `convex/values` for all function arguments.
- Public functions use `query`, `mutation`, `action`. Private functions use `internalQuery`, `internalMutation`, `internalAction`.
- Never accept userId as an argument — derive from `ctx.auth.getUserIdentity()`.
- Use `identity.tokenIdentifier` as the canonical user key.
- Never use `.filter()` — define indexes and use `.withIndex()`.
- Never use `.collect()` on unbounded queries — use `.take(n)` or paginate.
- Never store unbounded arrays in documents — use separate tables with foreign keys.
- Always include all index fields in the index name (e.g., `by_cohortId_and_status`).
- Put actions that need Node.js in separate files with `"use node";` at top.
- Never use `ctx.db` in actions.

### Next.js / UI
- This is Next.js 16. Use App Router with `src/app/` directory.
- Default to Server Components. Only add `'use client'` when needed.
- All request APIs are async: `await cookies()`, `await headers()`, `await params`, `await searchParams`.
- Route protection is in `src/proxy.ts` using Clerk middleware.
- Follow `DESIGN_SYSTEM.md` for all visual decisions:
  - Colors: Primary green `#00D632`, grayscale neutrals, semantic colors
  - Typography: Inter-like sans-serif, type scale from 11px to 32px
  - Layout: Three-panel desktop (sidebar 200px / content / detail 320px), bottom tab bar on mobile
  - Components: Use the documented patterns for modals, toasts, inputs, buttons, toggles, list rows, empty states
  - Mobile: Bottom tab bar, hamburger drawer, bottom sheets, 44px touch targets
  - Border radius: 8px default (md), 16px modals (xl), 999px pills (full)
  - Shadows: sm/md/lg/toast as documented
- Use Tailwind CSS v4 for styling.
- Install shadcn/ui components as needed (`npx shadcn@latest add [component]`).
- Every page needs: loading state, empty state, error state.
- Keep components in `src/components/` organized by feature.

### File Organization
```
src/
  app/
    (public)/           # Public routes
    (auth)/             # Auth routes (sign-in, sign-up)
    (dashboard)/        # All authenticated routes
      layout.tsx        # App shell with sidebar, nav, detail panel
      dashboard/        # Role-specific dashboard
      profile/          # User profile
      library/          # Resource library
      notifications/    # Notification center
      admin/            # Admin routes
      beneficiary/      # Beneficiary routes
      mentor/           # Mentor routes
      facilitator/      # Facilitator routes
  components/
    ui/                 # Shared UI primitives (buttons, inputs, modals, etc.)
    layout/             # App shell, sidebar, bottom nav, detail panel
    [feature]/          # Feature-specific components
  lib/
    utils.ts            # Shared utilities
    constants.ts        # Status enums, role constants
    auth.ts             # Auth helpers
convex/
  schema.ts             # Database schema
  users.ts              # User functions
  beneficiaries.ts      # Beneficiary profile functions
  cohorts.ts            # Cohort functions
  education.ts          # Education record functions
  documents.ts          # Document functions
  sessions.ts           # Session functions
  attendance.ts         # Attendance functions
  materials.ts          # Library/material functions
  support.ts            # Support request functions
  disbursements.ts      # Disbursement functions
  notifications.ts      # Notification functions
  assessments/
    templates.ts        # Assessment template functions
    assignments.ts      # Assignment functions
    responses.ts        # Response functions
    scoring.ts          # Scoring functions
  safeguarding.ts       # Safeguarding functions
  mentorNotes.ts        # Mentor note functions
  auditLogs.ts          # Audit log functions
  http.ts               # HTTP endpoints if needed
```

### Authorization Pattern
Every Convex query/mutation must check access:
```ts
// Pattern for all functions
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("Not authenticated");

const user = await ctx.db.query("users")
  .withIndex("by_tokenIdentifier", q => q.eq("tokenIdentifier", identity.tokenIdentifier))
  .unique();
if (!user) throw new Error("User not found");

// Then check role
if (user.role !== "admin") throw new Error("Unauthorized");
```

### What NOT To Do
- Do not skip lint/build verification.
- Do not implement UI without following DESIGN_SYSTEM.md.
- Do not leave `TODO` or `FIXME` comments — implement now or skip the task.
- Do not create empty placeholder files.
- Do not modify CLAUDE.md or AGENTS.md.
- Do not push to git — leave that for the human.
- Do not run `npx convex dev` — leave the dev server to the human.
- Do not create test files unless the task specifically says to.

## Phase Summary (Quick Reference)

- **Phase 0**: Foundation — folder structure, env validation, app shell, error boundaries
- **Phase 1**: Users, roles, authorization — Convex users table, role helpers, route protection
- **Phase 2**: Beneficiary profiles, cohorts, mentor assignments — schema + CRUD + UI
- **Phase 3**: Education records, document uploads — Nigerian education stages, file storage
- **Phase 4**: Sessions, enrollment, attendance, resource library — curriculum delivery
- **Phase 5**: Support requests, disbursements, evidence — financial workflow
- **Phase 6**: Notifications, delivery tracking, scheduled jobs
- **Phase 7**: Assessment templates — psychometric instruments, versioning
- **Phase 8**: Assessment assignment, completion UI, scoring engine
- **Phase 9**: Flags, safeguarding, sensitive data access controls
- **Phase 10**: Role-specific dashboards — beneficiary, admin, mentor, facilitator
- **Phase 11**: Mentorship — notes, mentee views, summary access
- **Phase 12**: Insights, analytics, development profile, growth charts
- **Phase 13**: Reports, CSV/PDF exports, alumni transition
- **Phase 14**: Operational hardening — audit logs, error handling, seed scripts

## Completion Signal

When EVERY `- [ ]` in `IMPLEMENTATION_PLAN.md` (Phases 0–14 and Cross-Cutting Checklists 10.1–10.5) has been changed to `- [x]`:

<promise>ALL PHASES COMPLETE</promise>

Do NOT output this promise until everything is done.

## Start Now

Read `IMPLEMENTATION_PLAN.md`, find the first unchecked task, and implement it.

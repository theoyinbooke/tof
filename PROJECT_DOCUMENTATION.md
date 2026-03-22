# TheOyinbooke Foundation Platform — Project Documentation

> Comprehensive technical and functional documentation for the TheOyinbooke Foundation (TOF) platform.
> Last updated: 2026-03-21

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture](#3-architecture)
4. [Database Schema](#4-database-schema)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Feature Inventory](#6-feature-inventory)
7. [Workflows & Approval Processes](#7-workflows--approval-processes)
8. [Scheduled Background Jobs](#8-scheduled-background-jobs)
9. [Route Map](#9-route-map)
10. [API Reference (Convex Functions)](#10-api-reference-convex-functions)
11. [Design System](#11-design-system)
12. [Sensitive Data Access Controls](#12-sensitive-data-access-controls)
13. [Audit & Compliance](#13-audit--compliance)
14. [Deployment & Environment](#14-deployment--environment)
15. [Implementation Status & Completeness](#15-implementation-status--completeness)
16. [Design Decisions & Rationale](#16-design-decisions--rationale)
17. [Known Gaps & Future Work](#17-known-gaps--future-work)

---

## 1. Project Overview

TheOyinbooke Foundation Platform is a full-stack web application designed to empower beneficiaries through education and holistic support. It serves four user roles — **admins**, **facilitators**, **mentors**, and **beneficiaries** — providing tools for:

- Beneficiary lifecycle management (application through alumni status)
- Nigerian education journey tracking (primary school through post-NYSC)
- Psychometric assessment creation, assignment, scoring, and safeguarding
- Financial support request workflows with disbursement and evidence tracking
- Session scheduling, enrollment, and attendance
- Mentorship pairing with private note-taking
- Document uploads with role-based visibility
- Notifications with deduplication and multi-channel delivery tracking
- Audit logging for compliance-sensitive operations

The platform was built in **15 phases** following a detailed implementation plan (`IMPLEMENTATION_PLAN.md`) with explicit pass/fail test criteria per phase. All 15 phases are marked complete.

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | 16.2.1 | Full-stack React framework (App Router) |
| UI Library | React | 19.2.4 | Component rendering |
| Language | TypeScript | ^5 | Type safety across frontend and backend |
| Styling | Tailwind CSS | ^4 | Utility-first CSS |
| Backend | Convex | ^1.34.0 | Real-time backend (database, functions, storage, cron jobs) |
| Authentication | Clerk | ^7.0.6 (@clerk/nextjs) | User sign-up/sign-in, JWT-based auth |
| Email | Resend | ^6.9.4 | Transactional email delivery via Resend API |
| Email Templates | react-email + @react-email/components | ^5.2.10 / ^1.0.10 | React-based email template rendering |
| Class Utilities | clsx + tailwind-merge | ^2.1.1 / ^3.5.0 | Conditional class merging |

**Key architectural choices:**

- **Convex over a traditional REST API**: Convex provides real-time subscriptions, built-in file storage, scheduled jobs, and a fully typed data layer — eliminating the need for separate database, ORM, file storage, and cron services.
- **Clerk over custom auth**: Clerk handles credential security, MFA, and social login. JWT integration with Convex means auth checks happen server-side in every function.
- **Next.js 16 App Router**: Server Components by default, `proxy.ts` instead of `middleware.ts`, all request APIs are async (`await cookies()`, `await headers()`, etc.).

---

## 3. Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────────────┐
│                     Browser                           │
│  Next.js App Router (React 19, Server Components)    │
│  ┌─────────┐  ┌──────────┐  ┌──────────────────┐    │
│  │ Clerk   │  │ Convex   │  │ Role-Based       │    │
│  │ Auth    │  │ React    │  │ Dashboards       │    │
│  │ Modal   │  │ Hooks    │  │ (Admin, Mentor,  │    │
│  │         │  │ (useQuery │  │  Facilitator,    │    │
│  │         │  │  useMut.) │  │  Beneficiary)    │    │
│  └────┬────┘  └────┬─────┘  └──────────────────┘    │
│       │             │                                 │
└───────┼─────────────┼─────────────────────────────────┘
        │             │
        │ JWT         │ WebSocket (real-time)
        │             │
┌───────┴─────────────┴─────────────────────────────────┐
│                    Convex Backend                       │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Auth       │  │ Queries /    │  │ File Storage  │  │
│  │ Validation │  │ Mutations /  │  │ (Documents,   │  │
│  │ (JWT from  │  │ Actions      │  │  Evidence)    │  │
│  │  Clerk)    │  │              │  │               │  │
│  └────────────┘  └──────────────┘  └───────────────┘  │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Cron Jobs  │  │ Real-Time    │  │ Database      │  │
│  │ (Reminders │  │ Subscriptions│  │ (22+ Tables)  │  │
│  │  Overdue)  │  │              │  │               │  │
│  └────────────┘  └──────────────┘  └───────────────┘  │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Email System (Resend API)                        │   │
│  │ 29 templates · Branded HTML layout · Idempotent  │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

### Directory Structure

```
tof/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── page.tsx                   # Public landing page
│   │   ├── layout.tsx                 # Root layout (Clerk + Convex providers)
│   │   ├── globals.css                # Global styles
│   │   └── (dashboard)/              # Auth-protected route group
│   │       ├── layout.tsx            # Dashboard layout (auth gate)
│   │       ├── loading.tsx           # Global loading state
│   │       ├── error.tsx             # Global error boundary
│   │       ├── dashboard/            # Role-agnostic hub
│   │       ├── profile/              # User profile
│   │       ├── notifications/        # Notification center
│   │       ├── library/              # Resource library
│   │       ├── admin/                # Admin-only routes
│   │       ├── beneficiary/          # Beneficiary routes
│   │       ├── mentor/               # Mentor routes
│   │       └── facilitator/          # Facilitator routes
│   ├── components/
│   │   ├── providers.tsx             # Convex + Clerk provider wiring
│   │   ├── user-sync.tsx             # UserSyncGate component
│   │   ├── layout/                   # Shell, sidebar, topbar, mobile nav, role guard
│   │   ├── dashboards/              # Role-specific dashboard components
│   │   ├── education/               # Education stepper
│   │   └── ui/                      # Shared UI components
│   ├── lib/                          # Utility functions
│   └── proxy.ts                      # Clerk auth middleware (Next.js 16)
├── convex/
│   ├── schema.ts                     # Full database schema (22 tables)
│   ├── auth.config.ts                # Clerk JWT config
│   ├── authHelpers.ts                # Authorization utilities
│   ├── validators.ts                 # Reusable validators
│   ├── users.ts                      # User management
│   ├── beneficiaries.ts             # Beneficiary profiles
│   ├── cohorts.ts                    # Cohort management
│   ├── sessions.ts                   # Session management
│   ├── attendance.ts                 # Attendance tracking
│   ├── mentorAssignments.ts         # Mentor pairing
│   ├── mentorNotes.ts               # Mentor observations
│   ├── education.ts                  # Education records
│   ├── documents.ts                  # Document management
│   ├── support.ts                    # Support request workflow
│   ├── disbursements.ts             # Financial disbursements
│   ├── safeguarding.ts              # Safeguarding actions
│   ├── notifications.ts             # Notifications + cron handlers
│   ├── email.ts                     # Resend API send/batch actions + delivery tracking
│   ├── emailHelpers.ts              # scheduleEmail, notifyWithEmail, notifyAdminsWithEmail
│   ├── emails/
│   │   ├── templates.ts             # 29 email templates (welcome, alerts, reminders, etc.)
│   │   └── layout.ts               # Branded HTML email layout with TOF styling
│   ├── materials.ts                  # Learning materials
│   ├── analytics.ts                  # Development profile aggregation
│   ├── exports.ts                    # Report data export
│   ├── auditLogs.ts                 # Audit trail
│   ├── crons.ts                     # Scheduled job definitions
│   └── assessments/
│       ├── templates.ts             # Assessment template CRUD
│       ├── assignments.ts           # Assessment assignment logic
│       ├── responses.ts             # Response submission + scoring trigger
│       ├── scoring.ts              # Score retrieval + flagged score listing
│       └── seed.ts                 # 16 instrument seed data (placeholder items)
├── IMPLEMENTATION_PLAN.md           # 15-phase feature delivery plan
├── SESSIONS_AND_ASSESSMENTS_REFERENCE.md  # Authoritative instrument specifications
├── Design-System.md                 # Visual design specification
├── CLAUDE.md                        # Agent coding instructions
└── AGENTS.md                        # Agent guidelines
```

### Data Flow Patterns

1. **Real-time subscriptions**: All dashboard data uses Convex `useQuery` hooks — changes are pushed to the client automatically via WebSocket.
2. **Optimistic updates**: Convex mutations return immediately on the client; the UI updates optimistically before server confirmation.
3. **Server-side authorization**: Every Convex query and mutation calls `requireUser()`, `requireRole()`, or a domain-specific helper before accessing data. The UI's `RoleGuard` component is a UX convenience only — security is enforced server-side.

---

## 4. Database Schema

The Convex database contains **22 tables** organized into 7 domains.

### 4.1 Core Identity

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | Central user record synced from Clerk | `clerkId`, `tokenIdentifier`, `email`, `name`, `role` (admin/facilitator/mentor/beneficiary), `isActive` |

**Indexes**: `by_clerkId`, `by_tokenIdentifier`, `by_email`, `by_role`, `by_role_and_isActive`

**Decision**: Users are created in Convex from the Clerk JWT on first sign-in via `getOrCreateUser()`. Subsequent sign-ins update the existing record (matched by `tokenIdentifier`). The `role` field defaults to `"beneficiary"` and can only be changed by admins.

### 4.2 Beneficiary Data

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `beneficiaryProfiles` | Extended beneficiary information | Personal info, family context, `lifecycleStatus`, `profileCompletionPercent` |
| `educationRecords` | Nigerian education journey | `stage` (9 values: primary → post_nysc), `isCurrent`, stage-specific fields (JAMB score, course, NYSC state/PPA) |
| `documents` | File uploads with access control | `storageId`, `category` (identity/education/support_evidence/other), `visibility` (owner_only/admin_only/owner_and_admin) |

**Lifecycle statuses**: `applicant` → `active` → `paused` → `completed` → `alumni` → `withdrawn`

**Education stages** (Nigerian system): `primary`, `jss` (Junior Secondary School), `sss` (Senior Secondary School), `jamb` (Joint Admissions and Matriculation Board), `university`, `polytechnic`, `coe` (College of Education), `nysc` (National Youth Service Corps), `post_nysc`

### 4.3 Cohorts & Sessions

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `cohorts` | Learning cohort groups | `name`, `isActive`, date range |
| `cohortMemberships` | User enrollment in cohorts | `cohortId`, `userId`, `status` (applicant/active/paused/completed/alumni/withdrawn) |
| `sessions` | Learning sessions/workshops | `sessionNumber`, `title`, `pillar`, `facilitatorId`, `cohortId`, `status` (draft/upcoming/active/completed/cancelled) |
| `sessionEnrollments` | Session enrollment | `sessionId`, `userId`, `status` (enrolled/dropped) |
| `sessionAttendance` | Attendance records | `sessionId`, `userId`, `status` (present/absent/excused), `markedBy` |
| `materials` | Educational resources | `type` (pdf/docx/youtube/link/audio), `pillar`, `sessionId`, `isRequired` |

### 4.4 Assessment System

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `assessmentTemplates` | Psychometric instrument definitions | `shortCode`, `version`, `status` (draft/published/archived), `items[]`, `subscales[]`, `severityBands[]` |
| `assessmentAssignments` | Assessment assignments to users | `templateId`, `userId`, `sessionId`, `status` (assigned/in_progress/completed/overdue), `dueDate` |
| `assessmentResponses` | Answer submissions | `assignmentId`, `answers` (record of itemNumber → value), `isSubmitted` |
| `assessmentScores` | Computed results | `totalScore`, `subscaleScores`, `severityBand`, `flagBehavior` (none/mentor_notify/admin_review) |

**Design decisions**:
- Templates are **immutable once published**. You archive a published template and create a new version; you never edit a published one.
- Items store `responseOptions` (Likert-scale values) and `isReversed` for reverse-scored items.
- Severity bands map score ranges to flag behaviors that trigger safeguarding workflows automatically.

### 4.5 Safeguarding

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `safeguardingActions` | Auto-created from flagged scores | `scoreId`, `userId`, `assignedTo`, `flagBehavior` (mentor_notify/admin_review), `status` (open/in_progress/resolved/dismissed) |

**Auto-assignment logic**: When `flagBehavior = "mentor_notify"`, the system looks up the beneficiary's active mentor and assigns the action to them. When `flagBehavior = "admin_review"`, the action is unassigned (admins pick it up from the queue).

### 4.6 Support & Financial

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `supportRequests` | Beneficiary support requests | `category` (tuition/books/transport/medical/accommodation/other), `status` (10-state machine), `amountRequested` |
| `supportRequestEvents` | Audit trail for status changes | `fromStatus`, `toStatus`, `performedBy`, `note` |
| `disbursements` | Financial disbursement records | `amount`, `bankReference`, `transferDate`, `evidenceStatus` (not_required/pending/submitted/verified/overdue), `evidenceDueDate` |

### 4.7 Mentorship

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `mentorAssignments` | Mentor-beneficiary pairings | `mentorId`, `beneficiaryUserId`, `isActive`, timestamps |
| `mentorNotes` | Mentor observations | `content`, `visibility` (mentor_only/mentor_and_admin) |

**Decision**: Only one active mentor assignment per beneficiary at a time. Creating a new assignment auto-deactivates the previous one, preserving the full assignment history.

### 4.8 Notifications & Audit

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `notifications` | In-app notifications | `type`, `title`, `body`, `eventKey` (deduplication), `isRead` |
| `notificationDeliveries` | Multi-channel delivery tracking | `channel` (in_app/email/sms), `status` (pending/sent/failed/skipped), `attemptCount` |
| `auditLogs` | System action tracking | `action`, `resource`, `resourceId`, `details` |

---

## 5. Authentication & Authorization

### Authentication Flow

```
User → Clerk Sign-In/Sign-Up Modal
     → Clerk generates JWT (using "convex" template)
     → Next.js proxy.ts validates session via Clerk middleware
     → Convex auth.config.ts validates JWT issuer domain
     → UserSyncGate component blocks dashboard until Convex user exists
     → getOrCreateUser() mutation creates/updates Convex user record
     → All subsequent Convex calls use ctx.auth.getUserIdentity()
```

### User Roles

| Role | Description | Access Level |
|------|-------------|-------------|
| `admin` | Foundation staff with full access | All data, all operations, user management, approvals, exports |
| `facilitator` | Session leaders | Own assigned sessions, attendance marking, material uploads |
| `mentor` | Assigned mentors | Own mentee data (summary only), note creation, safeguarding actions |
| `beneficiary` | Program participants | Own profile, education, assessments, support requests, documents |

### Authorization Helpers

All authorization is enforced server-side in Convex functions. The following helpers are defined in `convex/authHelpers.ts`:

| Helper | Purpose | Used By |
|--------|---------|---------|
| `requireIdentity()` | Verifies JWT exists | Base check for all |
| `requireUser()` | Verifies active Convex user record | All functions |
| `requireRole(...roles)` | Checks user has one of the specified roles | Role-gated functions |
| `requireAdmin()` | Shorthand for `requireRole("admin")` | Admin-only functions |
| `requireAdminOrFacilitator()` | Admin or facilitator | Session management |
| `requireAdminOrMentor()` | Admin or mentor | Mentee data access |
| `requireOwnerOrAdmin(ownerUserId)` | User owns the record or is admin | Beneficiary data |
| `requireFacilitatorForSession(sessionId)` | Facilitator is assigned to specific session | Session-scoped access |
| `requireMentorForBeneficiary(beneficiaryUserId)` | Mentor is assigned to specific beneficiary | Mentee-scoped access |

### Authorization Matrix

| Operation | Admin | Facilitator | Mentor | Beneficiary |
|-----------|-------|-------------|--------|-------------|
| Manage users (roles, deactivation) | Yes | No | No | No |
| Create/edit cohorts | Yes | No | No | No |
| Create/edit sessions | Yes | No | No | No |
| Mark attendance | Yes | Own sessions | No | No |
| Create/edit materials | Yes | Yes | No | No |
| Assign mentors | Yes | No | No | No |
| Create mentor notes | No | No | Own mentees | No |
| View mentor notes | Yes | No | Own notes | No |
| Create assessment templates | Yes | No | No | No |
| Assign assessments | Yes | No | No | No |
| Complete assessments | No | No | No | Own assignments |
| View full assessment scores | Yes | No | No | No |
| View score summaries | Yes | No | Own mentees | Own interpretations |
| Create support requests | No | No | No | Yes |
| Approve/decline requests | Yes | No | No | No |
| Create disbursements | Yes | No | No | No |
| Submit evidence | No | No | No | Own disbursements |
| Verify evidence | Yes | No | No | No |
| Manage safeguarding actions | Yes | No | Own assigned | No |
| Upload documents | Yes | Yes | No | Own documents |
| View documents | Yes (all) | No | No | Own documents |
| View audit logs | Yes | No | No | No |
| Generate exports/reports | Yes | No | No | No |

---

## 6. Feature Inventory

### 6.1 User Management
- Clerk-based sign-up/sign-in with modal flow
- Automatic Convex user record creation on first sign-in
- `UserSyncGate` component blocks dashboard until sync completes
- Admin can change user roles
- Admin can deactivate users (deactivated users cannot access the system)
- User list with role filtering

### 6.2 Beneficiary Profiles
- Extended profile with personal information (name, DOB, gender, phone, address, state of origin, LGA)
- Family context (guardian info, family size, household income)
- Foundation-managed fields (lifecycle status, admin notes)
- Auto-calculated profile completion percentage
- Lifecycle status management (applicant → active → paused → completed → alumni → withdrawn)

### 6.3 Education Journey Tracking
- Support for 9 Nigerian education stages: primary, JSS, SSS, JAMB, university, polytechnic, COE, NYSC, post-NYSC
- Stage-specific fields (JAMB score, course of study, NYSC state, NYSC PPA)
- Multiple education records per user (historical tracking)
- Current stage marker (`isCurrent` flag)
- Education stepper UI component for guided entry

### 6.4 Cohort Management
- Cohort creation with name, description, and date range
- Cohort membership with 6 lifecycle statuses
- Admin-only cohort management
- Membership filtering by status

### 6.5 Session Management
- Session creation with number, title, pillar, description, scheduled date, facilitator, and cohort
- Session status workflow: `draft` → `upcoming` → `active` → `completed` | `cancelled`
- Session enrollment for beneficiaries
- Facilitator-scoped session views
- Beneficiary session overview

### 6.6 Attendance Tracking
- Three attendance statuses: `present`, `absent`, `excused`
- Per-beneficiary notes on attendance records
- `markedBy` field tracks who recorded attendance
- Attendance rate calculation (present count / total)
- Facilitator and admin can mark attendance

### 6.7 Resource Library
- Material types: PDF, DOCX, YouTube, external link, audio
- Materials linked to pillars and/or sessions
- Required vs. recommended tagging
- Browse, filter, and search UI

### 6.8 Assessment System
- **Templates**: Immutable versioned psychometric instruments with structured items, response options (Likert scale), subscales, severity bands, and flag behaviors
- **Template lifecycle**: `draft` → `published` → `archived` (published templates cannot be mutated)
- **Assignment**: Individual or bulk (to all enrolled session participants)
- **Completion**: One-question-per-screen UI with progressive save, back/next navigation, and submission locking
- **Scoring**: Automated total/subscale scoring with reverse-item support, severity band mapping, and interpretation generation
- **Flagging**: Severity bands trigger automatic safeguarding actions (`mentor_notify` or `admin_review`)

### 6.9 Safeguarding
- Auto-created safeguarding actions when assessment scores hit flag thresholds
- Auto-assignment: `mentor_notify` → assigned to beneficiary's active mentor; `admin_review` → unassigned for admin pickup
- Status workflow: `open` → `in_progress` → `resolved` | `dismissed`
- Resolution notes and resolution audit logging
- Mentor sees summary view only (no raw response data)
- Beneficiary sees interpretation only (no raw scores)

### 6.10 Support Request Workflow
- Beneficiary creates support requests with title, description, category, and optional amount
- 10-state status machine with enforced valid transitions (see Section 7.1)
- Admin review, approval, and decline
- Event audit trail (every transition logged with actor and optional note)
- Status filtering for admin queue

### 6.11 Disbursement Management
- Admin creates disbursements for approved requests
- Fields: amount, bank reference, transfer date, evidence due date
- Evidence workflow: pending → submitted → verified | overdue
- Beneficiary uploads evidence files
- Admin verifies evidence
- Financial summary dashboard (total disbursed, pending/overdue/verified counts)

### 6.12 Document Management
- File upload to Convex storage with signed URL generation
- Document categorization: `identity`, `education`, `support_evidence`, `other`
- Three visibility levels: `owner_only`, `admin_only`, `owner_and_admin`
- Documents linkable to beneficiary profiles and support requests

### 6.13 Notifications & Email
- In-app notification creation with event-based deduplication (`eventKey`)
- Multi-channel delivery tracking (in_app, email, sms schema — in_app and email are active)
- Read/unread status with "mark all as read"
- Deep links to relevant pages
- Admin can send manual notifications
- Delivery status tracking (pending/sent/failed/skipped) with retry metadata

### 6.14 Email System (Resend Integration)
- **29 email templates** across 6 categories, rendered via React Email + custom HTML layout
- **Branded layout**: Dark header with TOF logo, network SVG visualization, green gradient divider, white content area, dark footer
- **Two from addresses**: `send@hello.theoyinbookefoundation.com` (account/onboarding) and `updates@notify.theoyinbookefoundation.com` (operational)
- **Idempotency**: Each email uses the notification `eventKey` as a Resend idempotency key — prevents duplicate sends
- **Delivery tracking**: Each email creates a `notificationDeliveries` record with channel `"email"`, tracks attempt count, error messages, and delivery status
- **Batch sending**: `sendBatch` action sends emails sequentially to respect Resend rate limits
- **Helper functions**: `scheduleEmail()`, `notifyWithEmail()` (in-app + email in one call), `notifyAdminsWithEmail()` (broadcast to all admins)

**Email template categories:**

| Category | Templates | Trigger Points |
|----------|-----------|----------------|
| Account & Onboarding (6) | welcome, role-assigned, account-deactivated, mentor-assigned, mentee-assigned, cohort-enrollment | User creation, role changes, mentor pairing |
| Sessions & Learning (4) | session-scheduled, session-reminder, session-cancelled, new-material | Session lifecycle, cron job (6h), material uploads |
| Assessments (4) | assessment-assigned, assessment-due-soon, assessment-overdue, assessment-results | Assignment, cron job (6h), scoring completion |
| Support & Finance (9) | support-request-received, support-request-admin, request-under-review, request-approved, request-declined, disbursement-created, evidence-requested, evidence-submitted, evidence-verified, evidence-overdue | Every support request state transition |
| Safeguarding (3) | safeguarding-alert-mentor, safeguarding-alert-admin, safeguarding-resolved | Flagged scores, resolution |

### 6.15 Role-Specific Dashboards
- **Beneficiary**: Profile completion, next session, pending assessments, recent notifications, quick links
- **Admin**: Total beneficiaries, pending support requests, upcoming sessions, assessment completion rate, disbursement summary, flagged scores, evidence overdue alerts
- **Mentor**: Mentee list, latest assessment summaries, recent activity, notes entry/history
- **Facilitator**: Assigned sessions, upcoming roster, attendance actions, materials entry point

### 6.16 Mentorship
- Admin assigns mentor-beneficiary pairings
- One active assignment per beneficiary at a time
- Assignment history preserved when mentors change
- Mentor notes with visibility control (`mentor_only`, `mentor_and_admin`)
- Mentee summary view (attendance, assessment trends, support summary without bank details)

### 6.17 Analytics & Development Profile
- Aggregated development profile combining: user record, beneficiary profile, education records, attendance stats, support requests, assessment scores, mentor assignment, and mentor notes
- Attendance rate calculation
- Admin-only access to full development profiles

### 6.18 Reports & Exports
- CSV export pipeline for admin-only datasets
- PDF report pipeline for board-ready summaries
- Report types: individual beneficiary, cohort, financial
- Export generation logged in audit trail
- Field redaction by report type

### 6.19 Audit Logging
- `logAuditEvent()` records privileged writes
- Tracks: user, action, resource type, resource ID, details
- Admin-only audit log querying (by user, action, or resource)

---

## 7. Workflows & Approval Processes

### 7.1 Support Request Workflow

This is the platform's most complex state machine with **10 states** and explicit transition rules.

```
                        ┌──────────┐
                        │  draft   │
                        └────┬─────┘
                             │ beneficiary submits
                             ▼
                        ┌──────────┐
                        │submitted │
                        └────┬─────┘
                    ┌────────┴────────┐
                    │ admin reviews   │ admin declines
                    ▼                 ▼
              ┌────────────┐    ┌──────────┐
              │under_review│    │ declined │ (terminal)
              └─────┬──────┘    └──────────┘
             ┌──────┴──────┐
             │ admin       │ admin declines
             │ approves    ▼
             ▼        ┌──────────┐
       ┌──────────┐   │ declined │
       │ approved │   └──────────┘
       └────┬─────┘
            │ admin creates disbursement
            ▼
       ┌──────────┐
       │disbursed │
       └────┬─────┘
            │
     ┌──────┴──────────┬───────────────┐
     │                 │               │
     ▼                 ▼               ▼
┌─────────────┐ ┌──────────┐    ┌──────────┐
│evidence_    │ │ verified │    │  closed  │ (terminal)
│requested    │ └─────┬────┘    └──────────┘
└──────┬──────┘       │
       │              │
       ▼              ▼
┌─────────────┐  ┌──────────┐
│evidence_    │  │  closed  │
│submitted    │  └──────────┘
└──────┬──────┘
  ┌────┴─────┐
  │          │
  ▼          ▼
┌────────┐ ┌─────────────┐
│verified│ │evidence_    │ (admin requests re-submission)
└───┬────┘ │requested    │
    │      └─────────────┘
    ▼
┌──────────┐
│  closed  │
└──────────┘
```

**Valid transitions (from `convex/support.ts`):**

| From Status | Allowed Transitions |
|-------------|-------------------|
| `draft` | `submitted` |
| `submitted` | `under_review`, `declined` |
| `under_review` | `approved`, `declined` |
| `approved` | `disbursed` |
| `disbursed` | `evidence_requested`, `verified`, `closed` |
| `evidence_requested` | `evidence_submitted` |
| `evidence_submitted` | `verified`, `evidence_requested` |
| `verified` | `closed` |
| `declined` | *(terminal — no transitions)* |
| `closed` | *(terminal — no transitions)* |

**Who can do what:**
- **Beneficiary**: Can only transition to `submitted` (submit request) or `evidence_submitted` (upload evidence). Can only act on their own requests.
- **Admin**: Can perform all other transitions (review, approve, decline, disburse, request evidence, verify, close).

**Every transition is audited**: A `supportRequestEvents` record is created with `fromStatus`, `toStatus`, `performedBy`, and optional `note`.

### 7.2 Assessment Assignment & Scoring Workflow

```
Admin creates template (draft)
        │
        ▼
Admin publishes template ──► Template becomes assignable
        │
        ▼
Admin assigns assessment ──► Individual or bulk (session-wide)
        │
        ▼ beneficiary sees assignment
┌──────────┐
│ assigned │
└────┬─────┘
     │ beneficiary starts
     ▼
┌────────────┐
│in_progress │ (progressive save of answers)
└─────┬──────┘
      │ beneficiary submits final answers
      ▼
┌────────────┐
│ completed  │
└─────┬──────┘
      │ scoring engine runs automatically
      ▼
┌──────────────────────────────────────────────┐
│ Score computed:                                │
│   - Total score                               │
│   - Subscale scores (sum of item groups)      │
│   - Reverse items scored inversely            │
│   - Severity band matched to total score      │
│   - Flag behavior determined from band        │
└────────┬─────────────────────────────────────┘
         │
         ├─── flagBehavior = "none" ──► No further action
         │
         ├─── flagBehavior = "mentor_notify" ──► Safeguarding action created
         │    └── Auto-assigned to beneficiary's active mentor
         │
         └─── flagBehavior = "admin_review" ──► Safeguarding action created
              └── Unassigned (admin picks up from queue)
```

**Overdue handling**: A cron job runs every 6 hours. If an assignment's `dueDate` has passed and its status is still `assigned` or `in_progress`, it is marked `overdue`.

### 7.3 Safeguarding Action Workflow

```
┌────────┐
│  open  │ ← Auto-created from flagged assessment score
└────┬───┘
     │ assigned user begins investigation
     ▼
┌─────────────┐
│ in_progress │
└──────┬──────┘
  ┌────┴─────┐
  │          │
  ▼          ▼
┌──────────┐ ┌───────────┐
│ resolved │ │ dismissed │
└──────────┘ └───────────┘
```

- **Admins** can perform all transitions and update: `recommendedAction`, `dueDate`, `assignedTo`, `resolutionNote`.
- **Resolution/dismissal** records `resolvedBy` and `resolvedAt`, and creates an audit log entry.
- Safeguarding actions are **deduplicated** — only one action per `scoreId`.

### 7.4 Assessment Template Lifecycle

```
┌───────┐     publish()     ┌───────────┐     archive()     ┌──────────┐
│ draft │ ──────────────► │ published │ ──────────────► │ archived │
└───────┘                   └───────────┘                   └──────────┘
```

- **Draft**: Can be edited freely.
- **Published**: Immutable. Cannot be edited. Can be assigned to users. Can only transition to `archived`.
- **Archived**: Immutable. Cannot be assigned. Existing assignments continue to reference it.
- **Versioning**: Templates are identified by `shortCode + version`. To update an instrument, archive the current version and create a new version.

### 7.5 Session Status Workflow

```
┌───────┐     ┌──────────┐     ┌────────┐     ┌───────────┐
│ draft │ ──► │ upcoming │ ──► │ active │ ──► │ completed │
└───────┘     └──────────┘     └────────┘     └───────────┘
                  │                                  ▲
                  │              ┌───────────┐       │
                  └────────────► │ cancelled │       │
                                 └───────────┘       │
                                                     │
                                ┌─────────────────────┘
                                (admin transitions manually)
```

### 7.6 Cohort Membership Lifecycle

```
applicant → active → paused → completed → alumni
                  └──────────────────────► withdrawn
```

### 7.7 Disbursement Evidence Workflow

```
┌──────────────┐     beneficiary uploads     ┌───────────┐     admin verifies     ┌──────────┐
│   pending    │ ──────────────────────────► │ submitted │ ───────────────────► │ verified │
└──────┬───────┘                             └───────────┘                     └──────────┘
       │
       │ cron detects past due date
       ▼
┌──────────┐     beneficiary uploads     ┌───────────┐
│ overdue  │ ──────────────────────────► │ submitted │
└──────────┘                             └───────────┘

Special: "not_required" — no evidence expected
```

### 7.8 User Onboarding Flow

```
1. User signs up via Clerk (landing page)
2. Clerk redirects to /dashboard
3. UserSyncGate activates:
   - Checks ctx.auth.getUserIdentity()
   - Calls getOrCreateUser() mutation
   - Blocks rendering until Convex user exists
4. Dashboard layout resolves user role
5. Role-specific dashboard renders
6. (If beneficiary) Profile creation prompt appears for incomplete profiles
```

**Decision**: `UserSyncGate` uses a React `useRef` to prevent duplicate sync attempts and provides loading/error states with refresh guidance.

---

## 8. Scheduled Background Jobs

Defined in `convex/crons.ts`, these jobs run automatically:

| Job Name | Interval | Handler | Purpose |
|----------|----------|---------|---------|
| Session reminders | Every 6 hours | `notifications.sendSessionReminders` | Finds upcoming sessions within 24 hours, sends notifications to enrolled users |
| Evidence overdue check | Every 12 hours | `notifications.sendEvidenceOverdueNotifications` | Marks overdue evidence, notifies beneficiary and all admins |
| Assessment overdue check | Every 6 hours | `assessments.assignments.markOverdue` | Marks assignments past due date as `overdue` |

**Session reminder logic**: Queries sessions with status `upcoming` where `scheduledDate` is between now and 24 hours from now. Sends a notification to each enrolled user with deduplication via `eventKey: session_reminder:{sessionId}:{userId}`.

**Evidence overdue logic**: Finds disbursements with `evidenceStatus = "pending"` where `evidenceDueDate < now`. Patches them to `overdue`, notifies the beneficiary, and notifies all admins.

---

## 9. Route Map

### Public Routes

| Path | Description |
|------|-------------|
| `/` | Landing page with animated network SVG. Sign Up / Sign In via Clerk modals. Redirects to `/dashboard` if authenticated. |

### Shared Authenticated Routes

| Path | Description | Roles |
|------|-------------|-------|
| `/dashboard` | Role-agnostic hub — renders the appropriate role dashboard | All |
| `/profile` | User profile management | All |
| `/library` | Resource library (materials browse/filter) | All |
| `/notifications` | Notification center (list, read/unread, deep links) | All |

### Admin Routes

| Path | Description |
|------|-------------|
| `/admin` | Admin dashboard overview |
| `/admin/users` | User list, role assignment, deactivation |
| `/admin/beneficiaries` | Beneficiary list with lifecycle/status filtering |
| `/admin/beneficiaries/[beneficiaryId]` | Full development profile (profile + education + attendance + support + assessments + mentorship) |
| `/admin/cohorts` | Cohort creation and membership management |
| `/admin/sessions` | Session scheduling and management |
| `/admin/sessions/[sessionId]` | Session detail with attendance marking |
| `/admin/assessments` | Assessment template list (draft/published/archived) |
| `/admin/assessments/[templateId]` | Template detail, editor (for drafts), publish/archive controls |
| `/admin/support` | Support request queue with status filtering |
| `/admin/support/[requestId]` | Request detail, transitions, disbursement, event history |
| `/admin/financial` | Financial dashboard (totals, pending/overdue evidence) |
| `/admin/safeguarding` | Safeguarding action queue |
| `/admin/reports` | Analytics and export generation |

### Beneficiary Routes

| Path | Description |
|------|-------------|
| `/beneficiary` | Beneficiary dashboard |
| `/beneficiary/assessments` | Assessment assignment list |
| `/beneficiary/assessments/[assignmentId]` | Assessment completion interface |
| `/beneficiary/education` | Education journey tracking |
| `/beneficiary/sessions` | Enrolled sessions view |
| `/beneficiary/support` | Support request submission and history |
| `/beneficiary/support/[requestId]` | Request status, evidence upload |
| `/beneficiary/documents` | Document management |

### Mentor Routes

| Path | Description |
|------|-------------|
| `/mentor` | Mentor dashboard |
| `/mentor/mentees` | Assigned mentee list |
| `/mentor/mentees/[beneficiaryId]` | Mentee profile summary, assessment trends, notes |
| `/mentor/notes` | Note creation interface |

### Facilitator Routes

| Path | Description |
|------|-------------|
| `/facilitator` | Facilitator dashboard |
| `/facilitator/sessions` | Assigned sessions list |
| `/facilitator/sessions/[sessionId]` | Session detail with attendance marking |

---

## 10. API Reference (Convex Functions)

### Users (`convex/users.ts`)

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `getOrCreateUser()` | mutation | identity | Sync Clerk JWT to Convex user record |
| `currentUser()` | query | user | Get current authenticated user |
| `getUserById(userId)` | query | user | Get any user by ID |
| `listUsers(role?)` | query | user | List users, optionally filtered by role |
| `updateRole(userId, role)` | mutation | admin | Change a user's role |
| `deactivateUser(userId)` | mutation | admin | Deactivate a user account |

### Beneficiaries (`convex/beneficiaries.ts`)

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `getProfile(userId)` | query | owner/admin | Get beneficiary profile |
| `getMyProfile()` | query | beneficiary | Get own profile |
| `createProfile(userId)` | mutation | admin | Create initial profile template |
| `updateProfile(userId, fields)` | mutation | owner/admin | Update profile fields |
| `getByStatus(lifecycleStatus)` | query | admin | Filter by lifecycle status |
| `getDevelopmentProfile(userId)` | query | admin | Full aggregated view |

### Cohorts (`convex/cohorts.ts`)

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `list()` | query | user | All cohorts |
| `getById(cohortId)` | query | user | Single cohort |
| `create(...)` | mutation | admin | Create cohort |
| `update(cohortId, ...)` | mutation | admin | Update cohort |
| `addMember(cohortId, userId, status)` | mutation | admin | Add member |
| `removeMember(cohortId, userId)` | mutation | admin | Remove member |
| `getMembers(cohortId, status?)` | query | user | List members |

### Sessions (`convex/sessions.ts`)

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `list(status?)` | query | user | All sessions |
| `getById(sessionId)` | query | user | Single session |
| `create(...)` | mutation | admin | Create session |
| `update(sessionId, ...)` | mutation | admin | Update session |
| `listByFacilitator()` | query | facilitator | Own sessions |
| `enroll(sessionId)` | mutation | beneficiary | Self-enroll |
| `getEnrollment(sessionId, userId)` | query | user | Check enrollment |

### Attendance (`convex/attendance.ts`)

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `markAttendance(sessionId, userId, status, notes)` | mutation | facilitator/admin | Record attendance |
| `getSessionAttendance(sessionId)` | query | facilitator/admin | All attendance for session |
| `getUserAttendance(userId)` | query | owner/admin | All attendance for user |

### Mentor Assignments (`convex/mentorAssignments.ts`)

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `assign(mentorId, beneficiaryUserId)` | mutation | admin | Create assignment (deactivates previous) |
| `endAssignment(assignmentId)` | mutation | admin | End assignment |
| `getActiveMentor(beneficiaryUserId)` | query | user | Current mentor |
| `getAssignmentHistory(beneficiaryUserId)` | query | user | All past/present mentors |
| `getActiveMentees()` | query | mentor | Current mentees |

### Mentor Notes (`convex/mentorNotes.ts`)

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `create(beneficiaryUserId, content, visibility)` | mutation | mentor/admin | Create note |
| `update(noteId, content, visibility)` | mutation | note author/admin | Update note |
| `listByBeneficiary(beneficiaryUserId)` | query | mentor/admin | Notes for a beneficiary |
| `listByMentor()` | query | mentor | Own notes |

### Education (`convex/education.ts`)

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `listByUser(userId)` | query | owner/admin | Education records |
| `getMyRecords()` | query | beneficiary | Own records |
| `create(userId, stage, isCurrent, ...)` | mutation | owner/admin | Add education record |
| `update(recordId, ...)` | mutation | owner/admin | Edit record |
| `getCurrent(userId)` | query | owner/admin | Current education stage |

### Documents (`convex/documents.ts`)

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `generateUploadUrl()` | mutation | user | Get Convex upload URL |
| `create(...)` | mutation | user | Create document record |
| `listByOwner(ownerId, category?)` | query | owner/admin | Documents by owner |
| `getMyDocuments(category?)` | query | user | Own documents |
| `getUrl(storageId)` | query | user | Signed download URL |

### Assessment Templates (`convex/assessments/templates.ts`)

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `create(...)` | mutation | admin | Create template |
| `publish(templateId)` | mutation | admin | Draft → published |
| `archive(templateId)` | mutation | admin | Published → archived |
| `getByShortCode(shortCode, version?)` | query | user | Lookup template |
| `listPublished()` | query | user | Available templates |
| `getById(templateId)` | query | user | Single template |

### Assessment Assignments (`convex/assessments/assignments.ts`)

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `assign(templateId, userId, sessionId?, dueDate?)` | mutation | admin | Individual assignment |
| `assignToSession(templateId, sessionId, dueDate?)` | mutation | admin | Bulk assign to enrolled users |
| `getMyAssignments()` | query | beneficiary | Own assignments |
| `getByUser(userId)` | query | owner/admin | User's assignments |
| `updateStatus(assignmentId, status)` | mutation | owner | Mark started/completed |

### Assessment Responses (`convex/assessments/responses.ts`)

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `submit(assignmentId, answers)` | mutation | owner | Submit responses (triggers scoring) |
| `getByAssignment(assignmentId)` | query | owner/admin | Responses for assignment |
| `getByUser(userId)` | query | owner/admin | All responses for user |

### Assessment Scoring (`convex/assessments/scoring.ts`)

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `getByAssignment(assignmentId)` | query | owner/admin | Score for assignment |
| `getByUser(userId)` | query | owner/admin | All scores for user |
| `listFlagged()` | query | admin | All flagged scores |

### Support Requests (`convex/support.ts`)

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `create(title, description, category, amount?)` | mutation | beneficiary | Create request |
| `transition(requestId, toStatus, note?)` | mutation | beneficiary/admin | State machine transition |
| `getMyRequests()` | query | beneficiary | Own requests |
| `getById(requestId)` | query | owner/admin | Request + events + disbursements |
| `listAll(status?)` | query | admin | All requests |
| `listWithBeneficiaries(status?)` | query | admin | Enriched with user data |

### Disbursements (`convex/disbursements.ts`)

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `create(requestId, amount, ...)` | mutation | admin | Create disbursement (must be for approved request) |
| `submitEvidence(disbursementId, storageId)` | mutation | owner/admin | Upload evidence |
| `verifyEvidence(disbursementId, notes?)` | mutation | admin | Verify submitted evidence |
| `listByRequest(requestId)` | query | user | Disbursements for request |
| `listOverdue()` | query | admin | Overdue evidence |
| `financialSummary()` | query | admin | Aggregate financial stats |

### Safeguarding (`convex/safeguarding.ts`)

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `createSafeguardingAction(...)` | internal | scoring engine | Auto-create from flagged score |
| `listAll(status?)` | query | admin | All actions (enriched) |
| `getByUser(userId)` | query | admin/mentor | Actions for user |
| `getMyAssigned()` | query | mentor/admin | Actions assigned to me |
| `updateAction(actionId, ...)` | mutation | admin | Update status, assignment, notes |
| `getScoreSummaryForMentor(userId)` | query | admin/mentor | Summary scores only (no item data) |
| `getScoreSummaryForBeneficiary()` | query | beneficiary | Interpretations only (no raw scores) |

### Notifications (`convex/notifications.ts`)

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `getMyNotifications()` | query | user | Latest 50 notifications |
| `getUnreadCount()` | query | user | Unread count |
| `markAsRead(notificationId)` | mutation | owner | Mark single read |
| `markAllAsRead()` | mutation | user | Mark all read |
| `send(...)` | mutation | admin | Manual notification |
| `listDeliveries(status?)` | query | admin | Delivery records |

### Email System (`convex/email.ts`, `convex/emailHelpers.ts`, `convex/emails/`)

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `email.send(deliveryId, to, recipientName, emailType, templateData, eventKey)` | internalAction | system | Send single email via Resend API with idempotency |
| `email.sendBatch(emails[])` | internalAction | system | Send multiple emails sequentially (rate-limit safe) |
| `email.updateDeliveryStatus(deliveryId, status, errorMessage?)` | internalMutation | system | Update delivery record after send attempt |
| `scheduleEmail(notificationId, userId, emailType, eventKey, templateData?)` | helper | mutations | Create pending delivery + schedule send action |
| `notifyWithEmail(userId, type, title, body, eventKey, emailType, templateData?)` | helper | mutations | Create in-app notification + schedule email in one call |
| `notifyAdminsWithEmail(type, title, body, eventKeyPrefix, emailType, templateData?)` | helper | mutations | Broadcast notification + email to all active admins |

**Email is triggered from these mutation files**: `users.ts` (welcome), `support.ts` (all status transitions), `disbursements.ts` (disbursement + evidence lifecycle), `mentorAssignments.ts` (assignment notifications), `materials.ts` (new material), `assessments/assignments.ts` (assignment + overdue), `assessments/responses.ts` (results available), `safeguarding.ts` (alerts + resolution).

### Exports (`convex/exports.ts`)

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `exportBeneficiaryReport(userId)` | mutation | admin | Individual beneficiary data (CSV-ready) |
| `exportCohortReport(cohortId)` | mutation | admin | Cohort membership data (CSV-ready) |
| `exportFinancialReport()` | mutation | admin | All disbursements, bank refs redacted |
| `transitionToAlumni(userId, convertToMentor?)` | mutation | admin | Transition to alumni + optional mentor conversion |

### Assessment Seed Data (`convex/assessments/seed.ts`)

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `seedTemplates()` | internalMutation | system | Seed 16 psychometric instruments as draft templates |

---

## 11. Design System

The platform follows a documented design system (`Design-System.md`) with these core principles:

- **Color**: Monochrome + one accent (`#00D632` brand green). Grayscale everywhere except semantic indicators.
- **Typography**: Inter font family, 14px base, 4px spacing unit.
- **Layout**: Three-panel desktop (sidebar 200px + main + detail 320px). Single-column mobile with bottom tab bar.
- **Components**: Clean/minimal aesthetic. White backgrounds, thin borders, generous whitespace. No gradients on surfaces.
- **Mobile**: Bottom sheet modals, hamburger drawer for sidebar, 44px minimum touch targets, safe area respect.
- **Animations**: Modal fade+scale (200ms), toast slide (300ms), toggle (200ms). All honor `prefers-reduced-motion`.

---

## 12. Sensitive Data Access Controls

The platform implements a tiered data access model for psychometric assessment data:

| Role | Score Access | Response Access | Safeguarding Access |
|------|-------------|-----------------|---------------------|
| **Admin** | Full scores, subscales, severity bands, flags | Full item-level responses | Full: all actions, all fields |
| **Mentor** | Summary only: total score, severity band, interpretation | **No access** to item-level responses | Own assigned actions only |
| **Facilitator** | Session-scoped only (authorized sessions) | No access | No access |
| **Beneficiary** | Interpretation and severity band only (no raw scores) | Own responses only | No access |

**Implementation**: Separate query functions for each role's data view:
- `safeguarding.getScoreSummaryForMentor()` — strips item-level data
- `safeguarding.getScoreSummaryForBeneficiary()` — returns only template name, severity band, and interpretation
- `scoring.listFlagged()` — admin-only, returns full score + user + template data

**Document visibility**: Three-tier system (`owner_only`, `admin_only`, `owner_and_admin`) enforced server-side in queries. Admins always have access.

**Mentor note visibility**: Two-tier system (`mentor_only`, `mentor_and_admin`). Beneficiaries never see mentor notes.

---

## 13. Audit & Compliance

### Audit Log Coverage

The `auditLogs` table records privileged operations:

| Action Type | When Logged |
|-------------|------------|
| `safeguarding_resolved` | Safeguarding action resolved |
| `safeguarding_dismissed` | Safeguarding action dismissed |
| Support request transitions | Each status change in `supportRequestEvents` |
| Export generation | Report export triggered |
| Role changes | Admin changes user role |
| User deactivation | Admin deactivates user |

### Event Trail

Support requests maintain a separate `supportRequestEvents` table that provides a complete, append-only audit trail of every status change including:
- Who performed the transition (`performedBy`)
- What the transition was (`fromStatus` → `toStatus`)
- Optional notes
- Timestamp

### Deduplication

Notifications use an `eventKey` field for deduplication — the same event (e.g., a session reminder for a specific user and session) will only create one notification even if the cron job runs multiple times.

---

## 14. Deployment & Environment

### Required Environment Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_JWT_ISSUER_DOMAIN=https://your-domain.clerk.accounts.dev

# Clerk Redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

# Convex Backend
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOYMENT=dev:your-project-id

# Email (Resend) — set in Convex dashboard as environment variable
RESEND_API_KEY=re_...

# Optional
SITE_URL=https://theoyinbookefoundation.com   # Used in email template links (defaults to theoyinbookefoundation.com)
```

### Clerk JWT Configuration

Clerk must be configured with a JWT template named `convex` that includes the standard claims. The `CLERK_JWT_ISSUER_DOMAIN` in Convex's `auth.config.ts` must match the Clerk issuer domain.

### Build & Run

```bash
npm install          # Install dependencies
npx convex dev       # Start Convex dev server (syncs schema, deploys functions)
npm run dev          # Start Next.js dev server
```

### Production Deployment

The application is designed for deployment on Vercel (Next.js frontend) with Convex as the managed backend. Both services need environment variables configured:
- Vercel: All `NEXT_PUBLIC_*` and `CLERK_SECRET_KEY` env vars
- Convex: `CLERK_JWT_ISSUER_DOMAIN` (set via Convex dashboard)

---

## 15. Implementation Status & Completeness

All 15 phases from `IMPLEMENTATION_PLAN.md` are marked complete. Here is the status of each:

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| 0 | Foundation Hardening | Complete | Scaffold, providers, auth, app shell |
| 1 | Identity, Users, Roles, Authorization | Complete | User model, role assignment, auth helpers |
| 2 | Beneficiary Lifecycle, Cohorts, Profiles | Complete | Profiles, cohorts, mentor assignment |
| 3 | Education Journey, Documents | Complete | 9 education stages, document uploads |
| 4 | Sessions, Enrollment, Attendance, Library | Complete | Sessions, enrollment, materials |
| 5 | Support Requests, Disbursements, Evidence | Complete | 10-state machine, disbursements |
| 6 | Notifications, Delivery Tracking | Complete | In-app notifications, cron jobs |
| 7 | Assessment Templates | Complete | Immutable versioned templates |
| 8 | Assessment Assignment, Completion, Scoring | Complete | Scoring engine, auto-flagging |
| 9 | Flags, Safeguarding, Sensitive Data | Complete | Safeguarding workflow, data access tiers |
| 10 | Dashboards by Role | Complete | 4 role-specific dashboards |
| 11 | Mentorship Features | Complete | Notes, mentee views |
| 12 | Insights, Analytics, Development Profile | Complete | Aggregated profiles, analytics |
| 13 | Reports, Exports, Alumni Transition | Complete | CSV/PDF exports, alumni lifecycle |
| 14 | Operational Hardening | Complete | Audit logs, error handling, seed data |

### All 33 Page Routes Built

The following page files exist and render (verified via glob):

- 4 role dashboards (`/admin`, `/beneficiary`, `/mentor`, `/facilitator`)
- 1 shared dashboard hub (`/dashboard`)
- 4 shared routes (`/profile`, `/library`, `/notifications`, `/dashboard`)
- 14 admin routes (users, beneficiaries, cohorts, sessions, assessments, support, financial, safeguarding, reports)
- 5 beneficiary routes (assessments, education, sessions, support, documents)
- 3 mentor routes (mentees, mentee detail, notes)
- 2 facilitator routes (sessions, session detail)

---

## 16. Design Decisions & Rationale

### Why Convex instead of a traditional REST API + database?

- **Real-time by default**: Dashboard data updates automatically via WebSocket subscriptions. No polling, no manual cache invalidation.
- **Typed end-to-end**: Convex generates TypeScript types from the schema, ensuring type safety from database to React component.
- **Built-in file storage**: Documents and evidence files upload directly to Convex storage with signed URLs — no S3 bucket configuration.
- **Built-in cron jobs**: Session reminders and overdue checks run as Convex scheduled functions — no separate job queue service.
- **Transactional mutations**: Each mutation runs in a transaction, preventing partial writes.

### Why immutable assessment templates?

Assessment instruments are psychometric tools with validated scoring methodologies. If a template could be edited after being assigned, existing scores would become meaningless (the questions they answered no longer match the template). Immutability ensures:
- Score integrity: A score always references the exact items the beneficiary answered.
- Audit trail: You can always reconstruct exactly what was administered.
- Versioning: Updates create new versions, preserving the old version's data.

### Why a 10-state support request machine instead of simpler approve/reject?

Real-world financial support involves:
1. Initial review (submitted → under_review)
2. Decision (approved/declined)
3. Actual funds transfer (disbursed)
4. Accountability (evidence requested → submitted → verified)
5. Exception handling (overdue evidence, re-request evidence)

Each state represents a real operational step that different actors perform at different times. Collapsing these would lose the audit trail and operational visibility.

### Why separate score views per role?

Psychometric assessment data is sensitive. Raw item-level responses could be misinterpreted without clinical training. The tiered access model ensures:
- **Admins** see everything (they oversee the program).
- **Mentors** see enough to support their mentees (severity band, interpretation) without accessing raw responses.
- **Beneficiaries** see interpretive feedback, not clinical scores.
- **Facilitators** have no access to individual assessment data.

### Why event-based notification deduplication?

Cron jobs run on intervals (every 6 hours). Without deduplication, a session reminder could be sent multiple times. The `eventKey` field (e.g., `session_reminder:{sessionId}:{userId}`) ensures each notification is created exactly once, regardless of how many times the cron job fires.

### Why only one active mentor per beneficiary?

The mentorship model requires a single primary relationship for accountability. If a beneficiary needs a different mentor, the old assignment ends (with preserved history) and a new one begins. This prevents confusion about who is responsible for safeguarding follow-up.

### Why Naira (₦) amounts in disbursements?

The platform serves Nigerian beneficiaries. Disbursement amounts are stored as numbers and displayed with the ₦ symbol. This is a deliberate choice to match the operational context.

### Why `proxy.ts` instead of `middleware.ts`?

Next.js 16 renamed `middleware.ts` to `proxy.ts`. The proxy runs on the Node.js runtime (not Edge), which provides access to the full Node.js API. Clerk's middleware integration works seamlessly in this configuration.

---

## 17. Known Gaps & Future Work

While all 15 implementation phases are marked complete in `IMPLEMENTATION_PLAN.md`, the following areas represent opportunities for enhancement or have partial implementations.

### Status Summary

| Area | Status | Notes |
|------|--------|-------|
| Email delivery | **Complete** | Resend integration with 29 templates, delivery tracking, idempotency |
| SMS delivery | Not started | Schema supports it, no provider integrated |
| Alumni mentor conversion | **Complete** | `transitionToAlumni(userId, convertToMentor)` with UI on admin/reports page |
| Assessment seed data | Partial | 16 instruments seeded with placeholder text only |
| Advanced filtering | Not started | Basic status/role filters only |
| Bulk operations UI | Not started | Server-side bulk exists, no dedicated UI |
| PDF reports | Not started | CSV export only, no PDF library |
| Data pagination | Not started | Fixed `.take(N)` limits everywhere |
| Component library | Not started | Custom Tailwind components |
| Automated testing | Not started | No test framework or test files |

---

### 17.1 SMS Delivery (Schema Ready, No Provider)

The `notificationDeliveries` table supports `sms` as a channel value with full status tracking (`pending`, `sent`, `failed`, `skipped`), retry counts, and error messages. However, no SMS provider (Twilio, Vonage, etc.) is installed or integrated. The email system pattern (`convex/email.ts`) provides a clear template for how to implement an SMS action.

### 17.2 Assessment Seed Data (Placeholder Text Only)

The 16 psychometric instruments are seeded via `convex/assessments/seed.ts`, but with **placeholder item text**: `"Item N — [Instrument text to be provided by admin]"`. All items default to a generic 5-point Likert scale regardless of the actual instrument requirements.

The authoritative specifications for all 16 instruments — including exact item wording, correct response scales (some use 7-point, not 5-point), reverse-scored items, subscale compositions, and severity band cut-points — are documented in `SESSIONS_AND_ASSESSMENTS_REFERENCE.md`. This reference document is partially written (Sessions 1–3 have full detail; the remainder need completion).

**To fully populate the instruments**: An admin would use the assessment template editor UI to update each draft template with the real item text, correct response scales, subscales, and severity bands from the reference document — then publish them.

### 17.3 Advanced Filtering and Search

Most list queries support basic filtering (by status, role, etc.), but advanced multi-field filtering, full-text search across tables, and saved filter presets are not yet implemented.

### 17.4 Bulk Operations UI

The `assignToSession()` mutation handles bulk assessment assignment server-side (assigns to all enrolled beneficiaries in a session). However, other potentially useful bulk operations — bulk user role changes, bulk cohort membership updates, bulk export selection — don't have dedicated UI surfaces.

### 17.5 PDF Report Generation

Only CSV export is currently implemented. The admin reports page (`/admin/reports`) generates CSV files client-side using a `downloadCsv()` helper. No PDF generation library (`@react-pdf/renderer`, `puppeteer`, `jspdf`, etc.) is installed. The server-side export mutations (`exportBeneficiaryReport`, `exportCohortReport`, `exportFinancialReport`) return structured data that could be fed into a PDF renderer.

### 17.6 Data Pagination

All Convex queries use `.take(N)` with fixed limits:
- Small collections: `.take(50)` (notifications, materials, mentor notes)
- Medium collections: `.take(100-200)` (users, sessions, support requests, documents)
- Large collections: `.take(1000)` (financial report export)

Convex's `.paginate()` API with cursor-based pagination is documented in the project's AI guidelines (`convex/_generated/ai/guidelines.md`) but is not used anywhere. For tables that grow (notifications, audit logs, disbursements, attendance), cursor-based pagination with a "load more" UI pattern would improve performance and prevent silent data truncation.

### 17.7 Component Library

The UI uses custom Tailwind CSS components. While `Design-System.md` provides comprehensive design tokens (colors, typography, spacing, border radius, shadows, animations), there is no shared component library (e.g., shadcn/ui). Adopting one would reduce duplication across the 33 page files and enforce design consistency.

### 17.8 Automated Testing

No test framework is configured:
- No `jest`, `vitest`, `playwright`, or `cypress` in `package.json`
- No test files (`.test.ts`, `.spec.ts`) in the codebase
- No `test` script in `package.json`
- The implementation plan explicitly states: *"manual exploratory testing is intentionally left to the product owner"*

High-value test targets for future coverage:
- **Convex function authorization**: Verify each function rejects unauthorized callers
- **Support request state machine**: Verify all valid transitions succeed and invalid ones throw
- **Assessment scoring engine**: Verify reverse scoring, subscale calculation, severity band matching, and flag behavior
- **Safeguarding auto-creation**: Verify flagged scores create the correct safeguarding actions with correct assignees
- **Email idempotency**: Verify duplicate event keys don't produce duplicate emails
- **E2E critical paths**: Beneficiary onboarding, assessment completion, support request lifecycle

### 17.9 Sessions & Assessments Reference Document (Partially Written)

`SESSIONS_AND_ASSESSMENTS_REFERENCE.md` is the authoritative reference for all 16 curriculum sessions and their mapped psychometric instruments. It currently has full detail for **Sessions 1–3** (Meaning in Life Questionnaire, Achievement Goal Questionnaire-Revised, and one more). The remaining sessions (4–16) need their full instrument specifications written — including exact item wording, response scales, subscale rules, severity bands, and flag thresholds.

---

*This documentation was generated from a thorough analysis of the complete codebase including all Convex functions, Next.js routes, components, configuration files, and planning documents. Last verified: 2026-03-21.*

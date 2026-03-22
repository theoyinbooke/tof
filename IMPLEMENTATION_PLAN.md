# TheOyinbooke Foundation Platform Implementation Plan

## 1. Purpose

This document is the execution plan for building the full platform on top of the existing scaffold.

It is intentionally task-oriented:

- every major feature is broken into implementation work
- each phase has explicit dependencies
- each feature area has pass/fail test criteria
- manual exploratory testing is intentionally left to the product owner

If this plan is followed in order, no major platform function should be omitted.

---

## 2. Current Baseline

The following is already working in the repo:

- public landing page at `/`
- Clerk sign-up and sign-in from the landing page
- protected dashboard route at `/dashboard`
- Clerk middleware via [`src/proxy.ts`](/Users/theoyinbooke/tof/src/proxy.ts)
- shared Clerk + Convex provider wiring
- Convex auth config for Clerk JWT

This means the project is already past the "can the stack talk to each other?" stage.

---

## 3. Source Of Truth Documents

These documents control implementation decisions:

1. [`IMPLEMENTATION_PLAN.md`](/Users/theoyinbooke/tof/IMPLEMENTATION_PLAN.md)
2. [`Design-System.md`](/Users/theoyinbooke/tof/Design-System.md) once it exists

Rules:

- functional behavior comes from this plan
- visual behavior, spacing, typography, colors, components, states, and layout conventions come from `Design-System.md`
- when `Design-System.md` is added, all UI tickets must be checked against it before implementation is considered done
- if this plan and `Design-System.md` conflict, functionality stays intact and the UI implementation should be adapted without changing behavior

---

## 4. Delivery Principles

- build in vertical slices, not disconnected pages
- enforce authorization in Convex and server code, not only in the UI
- ship schema and permissions before rich UI
- publish immutable assessment template versions
- treat sensitive assessment and support data as protected by default
- keep the design system consistent instead of improvising new UI patterns per page
- leave manual QA to the product owner, but define objective completion criteria for every feature

---

## 5. Global Definition Of Done

A phase is complete only when all of the following are true:

- implementation tasks in the phase are complete
- related routes render without runtime errors
- related Convex functions enforce authorization
- lint passes
- build passes
- no placeholder data paths are required for core flow completion
- error states, loading states, and empty states exist for all new screens
- UI follows `Design-System.md` if that file exists at implementation time

---

## 6. Platform Scope Checklist

The final platform must include all of the following modules:

- authentication and role-based access
- user sync and lifecycle management
- cohorts and enrollments
- beneficiary profiles
- Nigerian education journey tracking
- document upload and secure access
- session scheduling and attendance
- resource library
- support request and disbursement workflow
- psychometric assessment templates
- assessment assignment and reminders
- assessment completion UI
- assessment scoring and flags
- mentorship notes and mentee views
- admin, mentor, facilitator, and beneficiary dashboards
- notifications
- exports and reporting
- alumni transition
- operational hardening and audit logs

No module above should be treated as optional if the target is the full platform.

---

## 7. Route Inventory

### 7.1 Public Routes

- `/`

### 7.2 Shared Authenticated Routes

- `/dashboard`
- `/profile`
- `/library`
- `/notifications`

### 7.3 Beneficiary Routes

- `/beneficiary/assessments`
- `/beneficiary/assessments/[assignmentId]`
- `/beneficiary/support`
- `/beneficiary/support/[requestId]`
- `/beneficiary/sessions`

### 7.4 Admin Routes

- `/admin/users`
- `/admin/beneficiaries`
- `/admin/beneficiaries/[beneficiaryId]`
- `/admin/cohorts`
- `/admin/sessions`
- `/admin/sessions/[sessionId]`
- `/admin/assessments`
- `/admin/assessments/[templateId]`
- `/admin/support`
- `/admin/support/[requestId]`
- `/admin/financial`
- `/admin/reports`

### 7.5 Mentor Routes

- `/mentor/mentees`
- `/mentor/mentees/[beneficiaryId]`
- `/mentor/notes`

### 7.6 Facilitator Routes

- `/facilitator/sessions`
- `/facilitator/sessions/[sessionId]`
- `/facilitator/materials`
- `/facilitator/assessments`

---

## 8. Core Data Domains

The platform data model must cover these domains:

- users
- beneficiary profiles
- cohorts
- cohort memberships
- mentor assignments
- education records
- documents
- sessions
- session enrollments
- session attendance
- materials
- assessment templates
- assessment assignments
- assessment responses
- assessment scores
- safeguarding actions
- support requests
- support request events
- disbursements
- notifications
- notification deliveries
- audit logs

---

## 9. Phase Plan

## Phase 0: Foundation Hardening

### Goal

Turn the current scaffold into a stable application foundation before feature work starts.

### Dependencies

- current scaffold
- Clerk app
- Convex project
- `.env.local`

### Tasks

#### Project setup

- [x] finalize repository naming, metadata, and README setup flow
- [x] add an environment validation strategy for required keys
- [x] confirm local, preview, and production environment variable lists
- [x] standardize folder structure for `app`, `components`, `lib`, `convex`, and feature modules

#### Provider and auth foundation

- [x] keep Clerk provider and Convex provider initialization stable
- [x] add a single auth utility layer for server and client access
- [x] define app-level redirect behavior for unauthenticated and authenticated users
- [x] add route-group conventions for role-specific pages

#### Convex foundation

- [x] initialize Convex functions folder structure
- [x] add placeholder schema file
- [x] add internal helper utilities for auth and role enforcement
- [x] add user bootstrap flow from Clerk identity to Convex user record

#### App shell

- [x] replace the placeholder dashboard shell with a neutral app shell
- [x] add top-level loading state
- [x] add top-level error boundary
- [x] add not-found experience

### Test Criteria

- `npm run lint` passes
- `npm run build` passes
- unauthenticated users can open `/`
- authenticated users are redirected from `/` to `/dashboard`
- unauthenticated users cannot access `/dashboard`
- app boots with valid env values and fails clearly with invalid env values

---

## Phase 1: Identity, Users, Roles, And Authorization

### Goal

Create the real identity and permission model the rest of the platform depends on.

### Tasks

#### User model

- [x] create `users` table in Convex
- [x] store Clerk ID, email, display name, role, active state, timestamps
- [x] create user sync logic on first sign-in and subsequent updates
- [x] define allowed roles: `admin`, `facilitator`, `mentor`, `beneficiary`

#### Role assignment

- [x] define how admin assigns roles
- [x] define how role changes update Clerk metadata and Convex records
- [x] add role-aware redirect rules after login

#### Authorization

- [x] create server helpers for `requireAuth`
- [x] create server helpers for `requireRole`
- [x] create row-level ownership helpers for beneficiary-scoped data
- [x] create session-enrollment-based access helper for facilitators
- [x] create mentee-assignment-based access helper for mentors
- [x] create admin-only helper for financial and export routes

#### Route protection

- [x] protect role-specific route groups
- [x] add unauthorized state handling
- [x] ensure unauthorized users do not see data from other roles via server rendering

### Test Criteria

- first login creates a `users` record
- repeated login updates the same user, not a duplicate
- admin routes reject non-admins
- mentor routes reject users not assigned as mentors
- facilitator access is limited to allowed session scope
- beneficiary access is limited to own records
- server-side data fetching does not leak unauthorized data

---

## Phase 2: Beneficiary Lifecycle, Cohorts, And Profiles

### Goal

Create the beneficiary record structure and the core profile system.

### Tasks

#### Lifecycle and cohort model

- [x] create `cohorts` table
- [x] create `cohortMemberships` table
- [x] define beneficiary lifecycle statuses: `applicant`, `active`, `paused`, `completed`, `alumni`, `withdrawn`
- [x] add cohort assignment flow
- [x] add beneficiary activation/deactivation flow

#### Beneficiary profile

- [x] create `beneficiaryProfiles` table
- [x] implement profile ownership rules
- [x] implement personal information form
- [x] implement family context form
- [x] implement foundation-managed fields
- [x] calculate profile completion percent

#### Mentor assignment

- [x] create `mentorAssignments` table
- [x] support active and historical mentor assignments
- [x] surface active mentor on beneficiary profile

#### Profile screens

- [x] build beneficiary profile page
- [x] build admin beneficiary list
- [x] build admin beneficiary profile detail page
- [x] add empty states for incomplete profiles

### Test Criteria

- admin can create and manage cohorts
- beneficiary profile persists edits correctly
- profile completion recalculates when sections are completed
- mentor assignment history is preserved when mentors change
- only authorized users can view or edit profile sections
- admin beneficiary list can filter by cohort and lifecycle status

---

## Phase 3: Education Journey And Documents

### Goal

Support Nigerian education tracking and secure document management.

### Tasks

#### Education records

- [x] create `educationRecords` table
- [x] support all planned stages: primary, JSS, SSS, JAMB, university, polytechnic, COE, NYSC, post-NYSC
- [x] allow multiple records across time
- [x] enforce a single current stage where appropriate
- [x] support stage-specific fields and validation

#### Education UI

- [x] build education journey stepper
- [x] build add/edit stage forms
- [x] build current stage highlight logic
- [x] build admin read-only overview and beneficiary edit flow

#### Documents

- [x] create `documents` table
- [x] support file uploads to Convex storage
- [x] store metadata: uploader, owner, file type, size, visibility
- [x] implement secure file access helper
- [x] link documents to beneficiary profile and support workflows

#### Document UI

- [x] add uploads to profile
- [x] add document list
- [x] add file badges and metadata display
- [x] add download/view actions gated by permissions

### Test Criteria

- beneficiaries can add and edit education records
- admin can view full education history
- stage-specific fields persist correctly
- documents upload successfully and metadata is stored
- unauthorized users cannot access direct file URLs
- document visibility rules are enforced by server checks

---

## Phase 4: Sessions, Enrollment, Attendance, And Library

### Goal

Create the curriculum delivery layer.

### Tasks

#### Sessions

- [x] create `sessions` table
- [x] include session number, title, pillar, description, scheduled date, facilitator, status
- [x] support attaching sessions to a cohort
- [x] support draft/upcoming/active/completed workflow if needed

#### Session enrollment

- [x] create `sessionEnrollments` table
- [x] support cohort-based enrollment
- [x] support manual add/remove
- [x] distinguish enrollment status from attendance

#### Attendance

- [x] create `sessionAttendance` table
- [x] build attendance marking flow for admins and facilitators
- [x] support optional per-beneficiary notes
- [x] expose attendance history on beneficiary profile

#### Resource library

- [x] create `materials` table
- [x] support PDF, DOCX, YouTube, external link, audio
- [x] support pillar and session linkage
- [x] support required vs recommended tagging
- [x] build browse, filter, and search UI

#### Role-specific screens

- [x] build admin session management page
- [x] build facilitator sessions page
- [x] build beneficiary sessions overview
- [x] show upcoming session and required material summary on dashboard

### Test Criteria

- admin can create and edit sessions
- facilitator assignment persists correctly
- session enrollment creates the correct roster
- attendance can only be marked for enrolled beneficiaries
- facilitator can only mark attendance for assigned sessions
- library filters work by pillar, session, and search
- beneficiaries can only see materials they are allowed to access

---

## Phase 5: Support Requests, Disbursements, And Evidence

### Goal

Digitize the financial support workflow with auditability.

### Tasks

#### Support requests

- [x] create `supportRequests` table
- [x] create `supportRequestEvents` table
- [x] implement request creation by beneficiary
- [x] implement approval and decline by admin
- [x] enforce valid status transitions

#### Disbursements

- [x] create `disbursements` table
- [x] implement disbursement recording by admin
- [x] support bank reference and transfer date
- [x] support adjustments instead of destructive edits

#### Evidence workflow

- [x] allow evidence upload after disbursement
- [x] support verification and evidence requested states
- [x] mark overdue evidence
- [x] surface overdue items to admin

#### UI

- [x] build beneficiary support request form
- [x] build beneficiary support request history
- [x] build admin request queue
- [x] build admin request detail page
- [x] build financial dashboard summary cards and tables

### Test Criteria

- beneficiary can create a request with required fields only
- invalid transitions are rejected
- admin can approve, decline, and disburse correctly
- event history is append-only
- evidence can only be uploaded for eligible disbursements
- overdue status is derived correctly
- mentor views do not expose bank references or sensitive evidence

---

## Phase 6: Notifications And Delivery Tracking

### Goal

Create the notification system that supports time-based automation and delivery visibility.

### Tasks

#### Data model

- [x] create `notifications` table
- [x] create `notificationDeliveries` table
- [x] define event keys for deduplication

#### In-app notifications

- [x] build notification list UI
- [x] build unread indicator
- [x] support mark as read
- [x] support deep links into relevant pages

#### Delivery system

- [x] create helper for creating notification records
- [x] create helper for creating delivery records
- [x] support `pending`, `sent`, `failed`, and `skipped` delivery states
- [x] add retry-safe scheduling pattern

#### Scheduled jobs

- [x] schedule session reminders
- [x] schedule assessment reminders
- [x] schedule evidence overdue notifications

### Test Criteria

- notification records are created once per triggering event
- delivery records are linked to user and event key
- duplicate schedules do not create duplicate deliveries
- failed deliveries remain visible for troubleshooting
- unread count updates when notifications are read

---

## Phase 7: Assessment Template System

### Goal

Build the configuration layer for psychometric instruments.

### Tasks

#### Template model

- [x] create `assessmentTemplates` table
- [x] support version number
- [x] support draft, published, archived status
- [x] store instrument metadata, source citation, license notes, adaptation notes
- [x] store item definitions, response options, scoring direction, subscales, bands

#### Template lifecycle

- [x] implement draft creation
- [x] implement publish action
- [x] prevent destructive edits to published templates
- [x] implement archive action

#### Seed data

- [x] seed all 16 instruments
- [x] confirm session mapping
- [x] record any wording adaptations explicitly

#### Admin UI

- [x] build template list
- [x] build template detail page
- [x] build template editor for draft records
- [x] build publish/archive controls

### Test Criteria

- published templates cannot be mutated in place
- assignments reference the exact template version used
- all template scoring metadata is stored completely
- all 16 planned instruments can be seeded successfully
- admin can browse templates without editing archived versions

---

## Phase 8: Assessment Assignment, Completion, And Scoring

### Goal

Make assessments executable from assignment through score generation.

### Tasks

#### Assignment

- [x] create `assessmentAssignments` table
- [x] support session-linked assignment
- [x] support individual assignment
- [x] support due dates and status tracking
- [x] link assignment to template version

#### Completion flow

- [x] create `assessmentResponses` table
- [x] build one-question-per-screen UI
- [x] support progressive save
- [x] support back/next navigation
- [x] prevent editing after final submission

#### Scoring

- [x] create `assessmentScores` table
- [x] implement reverse scoring
- [x] implement total and subscale scoring
- [x] implement severity band selection
- [x] implement interpretation generation

#### Scheduling

- [x] auto-create assignments for enrolled session participants
- [x] send reminder events at configured times
- [x] mark overdue assignments appropriately

### Test Criteria

- assignments are created for the correct beneficiaries only
- an individual assignment does not leak to other users
- responses save progressively without losing earlier answers
- submission locks the response
- scores match template logic for total, subscale, and severity
- overdue logic works without altering completed assignments

---

## Phase 9: Flags, Safeguarding, And Sensitive Data Controls

### Goal

Create the operational response layer for concerning assessment outcomes.

### Tasks

#### Flag logic

- [x] map severity bands to flag behavior
- [x] support `mentor_notify` and `admin_review`
- [x] create flags on score generation when thresholds are met

#### Safeguarding workflow

- [x] create `safeguardingActions` table
- [x] assign owner user
- [x] support status: open, in progress, resolved, dismissed
- [x] capture recommended action, due date, resolution note

#### Sensitive data handling

- [x] ensure mentors only see summary scores
- [x] ensure beneficiaries only see summary interpretations
- [x] ensure facilitators only see full detail for authorized session-linked scope
- [x] ensure exports redact unauthorized data

#### UI

- [x] build flagged scores list for admin
- [x] build safeguarding detail section on admin beneficiary view
- [x] build mentor notification summary view without raw response access

### Test Criteria

- threshold-crossing scores create the correct flag behavior
- safeguarding actions are created for required cases
- mentors do not receive item-level access
- beneficiaries do not receive raw score detail if policy disallows it
- admins can resolve safeguarding actions with an audit trail

---

## Phase 10: Dashboards By Role

### Goal

Turn the raw system into usable role-specific workspaces.

### Tasks

#### Beneficiary dashboard

- [x] profile completion summary
- [x] next session card
- [x] pending assessments
- [x] recent notifications
- [x] quick links to support and library

#### Admin dashboard

- [x] total beneficiaries
- [x] pending support requests
- [x] upcoming sessions
- [x] assessment completion rate
- [x] disbursement summary
- [x] flagged scores
- [x] evidence overdue alerts

#### Mentor dashboard

- [x] mentee list
- [x] latest summary assessment results
- [x] recent activity
- [x] notes entry and history

#### Facilitator dashboard

- [x] assigned sessions
- [x] upcoming roster
- [x] attendance actions
- [x] materials management entry point

### Test Criteria

- each role sees only its intended dashboard content
- dashboard cards are backed by real data, not placeholders
- empty-state rendering works with no records
- loading states render without layout breakage

---

## Phase 11: Mentorship Features

### Goal

Support structured mentor engagement without overexposing sensitive data.

### Tasks

#### Notes

- [x] create `mentorNotes` table
- [x] define note visibility
- [x] build note creation UI
- [x] build note history timeline

#### Mentee view

- [x] build mentee summary page
- [x] include attendance summary
- [x] include assessment summary trends
- [x] include support summary without bank details

### Test Criteria

- mentor can only create notes for assigned mentees
- admin can view mentor notes
- beneficiary cannot see mentor notes
- mentee view shows summaries only, not restricted fields

---

## Phase 12: Insights, Analytics, And Development Profile

### Goal

Create the decision-support layer for admins and mentors.

### Tasks

#### Development profile

- [x] combine profile, education, attendance, support, assessments, and mentorship into one admin view
- [x] support tabbed or sectioned navigation
- [x] surface recent activity and key metrics

#### Analytics

- [x] implement instrument-level growth charts
- [x] implement normalized pillar-level indicators
- [x] implement cohort averages with documented eligibility rules
- [x] implement admin cohort overview

#### Timeline

- [x] add event timeline across sessions, support, assessments, and education milestones

### Test Criteria

- development profile renders complete data for a beneficiary with mixed activity
- growth charts do not combine incomparable raw instruments incorrectly
- cohort averages exclude invalid or incomplete data according to rule set
- timeline events are ordered and deduplicated correctly

---

## Phase 13: Reports, Exports, And Alumni Transition

### Goal

Support donor, board, and internal reporting while preserving lifecycle transitions.

### Tasks

#### Exports

- [x] create CSV export pipeline for admin-only datasets
- [x] create PDF report pipeline for board-ready summaries
- [x] log export generation in audit logs
- [x] apply field redaction by report type

#### Report types

- [x] individual beneficiary report
- [x] cohort report
- [x] financial report

#### Alumni transition

- [x] support lifecycle change to `alumni`
- [x] preserve historical records
- [x] keep selected library access
- [x] support optional future mentor conversion

### Test Criteria

- only admins can generate exports
- exported datasets match authorized fields only
- export generation is auditable
- alumni retain history and allowed access without corrupting previous records

---

## Phase 14: Operational Hardening

### Goal

Make the platform safe to operate beyond prototype stage.

### Tasks

#### Auditability

- [x] create `auditLogs` table usage pattern
- [x] log privileged writes
- [x] log export generation
- [x] log sensitive workflow resolutions where needed

#### Failure handling

- [x] add route-level error states
- [x] add mutation error handling
- [x] add file upload failure handling
- [x] add notification failure visibility

#### Data quality and maintenance

- [x] add status constants and shared validators
- [x] add seed scripts for foundational data
- [x] add migration approach for schema changes

#### Deployment readiness

- [x] define preview and production env requirements
- [x] define backup/export policy
- [x] define monitoring/logging choice

### Test Criteria

- sensitive writes generate audit entries
- major workflow failures return actionable errors
- seed data can be recreated without corrupting existing production data
- preview and production builds use correct environment separation

---

## 10. Cross-Cutting Acceptance Checklists

## 10.1 Authorization Checklist

- [x] every Convex query checks access
- [x] every Convex mutation checks access
- [x] file access is authorized through owning record context
- [x] route protection and data protection both exist
- [x] no role can discover unauthorized record IDs through lists or detail routes

## 10.2 UI Checklist

- [x] loading state
- [x] empty state
- [x] error state
- [x] success confirmation where appropriate
- [x] responsive layout
- [x] design system compliance when `Design-System.md` exists

## 10.3 Data Integrity Checklist

- [x] all state transitions are explicit
- [x] destructive history edits are avoided
- [x] versioned templates remain immutable
- [x] timestamps exist for operational events
- [x] audit trail exists for privileged actions

## 10.4 Notification Checklist

- [x] event definition exists
- [x] record creation exists
- [x] delivery tracking exists
- [x] deduplication strategy exists
- [x] failure handling exists

## 10.5 Dashboard Checklist

- [x] beneficiary dashboard
- [x] admin dashboard
- [x] mentor dashboard
- [x] facilitator dashboard

---

## 11. Recommended Build Order

Follow this order:

1. Phase 0 foundation hardening
2. Phase 1 identity and authorization
3. Phase 2 profiles and cohorts
4. Phase 3 education and documents
5. Phase 4 sessions, enrollment, attendance, library
6. Phase 5 support requests and finance workflow
7. Phase 6 notifications
8. Phase 7 assessment templates
9. Phase 8 assignments, completion, scoring
10. Phase 9 safeguarding and sensitive access rules
11. Phase 10 dashboards
12. Phase 11 mentorship
13. Phase 12 insights
14. Phase 13 reports and alumni
15. Phase 14 hardening

Do not start advanced analytics or exports before the underlying workflows are complete and trustworthy.

---

## 12. Immediate Next Action

The scaffold is already complete enough to begin real delivery work.

The next implementation step should be:

- create the Convex schema and auth helper layer
- create the `users`, `beneficiaryProfiles`, `cohorts`, and `cohortMemberships` tables
- implement first-sign-in user bootstrap
- implement role-aware dashboard routing

That is the smallest next slice that unlocks the rest of the platform.

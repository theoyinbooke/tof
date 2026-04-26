// String arrays mirroring Convex schema unions for Zod enum validation.
// Keep in sync with convex/schema.ts.

export const ROLES = [
  "admin",
  "facilitator",
  "mentor",
  "beneficiary",
] as const;

export const SESSION_STATUSES = [
  "draft",
  "upcoming",
  "active",
  "completed",
  "cancelled",
] as const;

export const COHORT_MEMBERSHIP_STATUSES = [
  "applicant",
  "active",
  "paused",
  "completed",
  "alumni",
  "withdrawn",
] as const;

export const SUPPORT_REQUEST_STATUSES = [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "declined",
  "disbursed",
  "evidence_requested",
  "evidence_submitted",
  "verified",
  "closed",
] as const;

export const SUPPORT_CATEGORIES = [
  "tuition",
  "books",
  "transport",
  "medical",
  "accommodation",
  "upkeep",
  "other",
] as const;

export const SAFEGUARDING_STATUSES = [
  "open",
  "in_progress",
  "resolved",
  "dismissed",
] as const;

export const FLAG_BEHAVIORS = [
  "none",
  "mentor_notify",
  "admin_review",
] as const;

export const ATTENDANCE_STATUSES = [
  "present",
  "absent",
  "excused",
] as const;

export const ASSESSMENT_TEMPLATE_STATUSES = [
  "draft",
  "published",
  "archived",
] as const;

export const ASSIGNMENT_STATUSES = [
  "assigned",
  "in_progress",
  "completed",
  "overdue",
] as const;

export const EVIDENCE_STATUSES = [
  "not_required",
  "pending",
  "submitted",
  "verified",
  "overdue",
] as const;

export const LIFECYCLE_STATUSES = [
  "applicant",
  "active",
  "paused",
  "completed",
  "alumni",
  "withdrawn",
] as const;

export const OPERATIONAL_EXPENSE_CATEGORIES = [
  "school_fees",
  "supplies",
  "transport",
  "utilities",
  "salaries",
  "events",
  "equipment",
  "rent",
  "other",
] as const;

export const ROLES = {
  ADMIN: "admin",
  FACILITATOR: "facilitator",
  MENTOR: "mentor",
  BENEFICIARY: "beneficiary",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const BENEFICIARY_STATUSES = {
  APPLICANT: "applicant",
  ACTIVE: "active",
  PAUSED: "paused",
  COMPLETED: "completed",
  ALUMNI: "alumni",
  WITHDRAWN: "withdrawn",
} as const;

export type BeneficiaryStatus =
  (typeof BENEFICIARY_STATUSES)[keyof typeof BENEFICIARY_STATUSES];

export const SUPPORT_REQUEST_STATUSES = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under_review",
  APPROVED: "approved",
  DECLINED: "declined",
  DISBURSED: "disbursed",
  EVIDENCE_REQUESTED: "evidence_requested",
  EVIDENCE_SUBMITTED: "evidence_submitted",
  VERIFIED: "verified",
  CLOSED: "closed",
} as const;

export type SupportRequestStatus =
  (typeof SUPPORT_REQUEST_STATUSES)[keyof typeof SUPPORT_REQUEST_STATUSES];

export const SESSION_STATUSES = {
  DRAFT: "draft",
  UPCOMING: "upcoming",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type SessionStatus =
  (typeof SESSION_STATUSES)[keyof typeof SESSION_STATUSES];

export const ASSESSMENT_TEMPLATE_STATUSES = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

export type AssessmentTemplateStatus =
  (typeof ASSESSMENT_TEMPLATE_STATUSES)[keyof typeof ASSESSMENT_TEMPLATE_STATUSES];

export const ASSIGNMENT_STATUSES = {
  ASSIGNED: "assigned",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  OVERDUE: "overdue",
} as const;

export type AssignmentStatus =
  (typeof ASSIGNMENT_STATUSES)[keyof typeof ASSIGNMENT_STATUSES];

export const EDUCATION_STAGES = {
  PRIMARY: "primary",
  JSS: "jss",
  SSS: "sss",
  JAMB: "jamb",
  UNIVERSITY: "university",
  POLYTECHNIC: "polytechnic",
  COE: "coe",
  NYSC: "nysc",
  POST_NYSC: "post_nysc",
} as const;

export type EducationStage =
  (typeof EDUCATION_STAGES)[keyof typeof EDUCATION_STAGES];

export const PILLARS = {
  PERSONAL_DEVELOPMENT: "personal_development",
  ACADEMIC_EXCELLENCE: "academic_excellence",
  CAREER_READINESS: "career_readiness",
  FINANCIAL_LITERACY: "financial_literacy",
  HEALTH_WELLNESS: "health_wellness",
  LEADERSHIP: "leadership",
} as const;

export type Pillar = (typeof PILLARS)[keyof typeof PILLARS];

export const ROLE_DASHBOARD_PATHS: Record<Role, string> = {
  admin: "/dashboard",
  facilitator: "/dashboard",
  mentor: "/dashboard",
  beneficiary: "/dashboard",
};

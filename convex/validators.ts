import { v } from "convex/values";

/** Reusable validators for consistent validation across functions */

export const roleValidator = v.union(
  v.literal("admin"),
  v.literal("facilitator"),
  v.literal("mentor"),
  v.literal("beneficiary"),
);

export const beneficiaryStatusValidator = v.union(
  v.literal("applicant"),
  v.literal("active"),
  v.literal("paused"),
  v.literal("completed"),
  v.literal("alumni"),
  v.literal("withdrawn"),
);

export const sessionStatusValidator = v.union(
  v.literal("draft"),
  v.literal("upcoming"),
  v.literal("active"),
  v.literal("completed"),
  v.literal("cancelled"),
);

export const supportRequestStatusValidator = v.union(
  v.literal("draft"),
  v.literal("submitted"),
  v.literal("under_review"),
  v.literal("approved"),
  v.literal("declined"),
  v.literal("disbursed"),
  v.literal("evidence_requested"),
  v.literal("evidence_submitted"),
  v.literal("verified"),
  v.literal("closed"),
);

export const assessmentTemplateStatusValidator = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("archived"),
);

export const assignmentStatusValidator = v.union(
  v.literal("assigned"),
  v.literal("in_progress"),
  v.literal("completed"),
  v.literal("overdue"),
);

export const educationStageValidator = v.union(
  v.literal("primary"),
  v.literal("jss"),
  v.literal("sss"),
  v.literal("jamb"),
  v.literal("university"),
  v.literal("polytechnic"),
  v.literal("coe"),
  v.literal("nysc"),
  v.literal("post_nysc"),
);

export const documentCategoryValidator = v.union(
  v.literal("identity"),
  v.literal("education"),
  v.literal("support_evidence"),
  v.literal("other"),
);

export const documentVisibilityValidator = v.union(
  v.literal("owner_only"),
  v.literal("admin_only"),
  v.literal("owner_and_admin"),
);

export const attendanceStatusValidator = v.union(
  v.literal("present"),
  v.literal("absent"),
  v.literal("excused"),
);

export const materialTypeValidator = v.union(
  v.literal("pdf"),
  v.literal("docx"),
  v.literal("youtube"),
  v.literal("link"),
  v.literal("audio"),
);

export const supportCategoryValidator = v.union(
  v.literal("tuition"),
  v.literal("books"),
  v.literal("transport"),
  v.literal("medical"),
  v.literal("accommodation"),
  v.literal("upkeep"),
  v.literal("other"),
);

export const flagBehaviorValidator = v.union(
  v.literal("none"),
  v.literal("mentor_notify"),
  v.literal("admin_review"),
);

export const safeguardingStatusValidator = v.union(
  v.literal("open"),
  v.literal("in_progress"),
  v.literal("resolved"),
  v.literal("dismissed"),
);

export const notificationDeliveryStatusValidator = v.union(
  v.literal("pending"),
  v.literal("sent"),
  v.literal("failed"),
  v.literal("skipped"),
);

export const evidenceStatusValidator = v.union(
  v.literal("not_required"),
  v.literal("pending"),
  v.literal("submitted"),
  v.literal("verified"),
  v.literal("overdue"),
);

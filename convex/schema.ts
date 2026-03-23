import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    tokenIdentifier: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("facilitator"),
      v.literal("mentor"),
      v.literal("beneficiary"),
    ),
    isActive: v.boolean(),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_role_and_isActive", ["role", "isActive"]),

  mentorAssignments: defineTable({
    mentorId: v.id("users"),
    beneficiaryUserId: v.id("users"),
    isActive: v.boolean(),
    assignedAt: v.number(),
    endedAt: v.optional(v.number()),
  })
    .index("by_mentorId", ["mentorId"])
    .index("by_mentorId_and_isActive", ["mentorId", "isActive"])
    .index("by_beneficiaryUserId", ["beneficiaryUserId"])
    .index("by_beneficiaryUserId_and_isActive", [
      "beneficiaryUserId",
      "isActive",
    ]),

  sessions: defineTable({
    sessionNumber: v.number(),
    title: v.string(),
    pillar: v.string(),
    description: v.optional(v.string()),
    scheduledDate: v.optional(v.number()),
    facilitatorId: v.optional(v.id("users")),
    cohortId: v.optional(v.id("cohorts")),
    status: v.union(
      v.literal("draft"),
      v.literal("upcoming"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_facilitatorId", ["facilitatorId"])
    .index("by_cohortId", ["cohortId"])
    .index("by_status", ["status"]),

  cohorts: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_isActive", ["isActive"]),

  cohortMemberships: defineTable({
    cohortId: v.id("cohorts"),
    userId: v.id("users"),
    status: v.union(
      v.literal("applicant"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("alumni"),
      v.literal("withdrawn"),
    ),
    joinedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_cohortId", ["cohortId"])
    .index("by_userId", ["userId"])
    .index("by_cohortId_and_status", ["cohortId", "status"])
    .index("by_userId_and_status", ["userId", "status"]),

  beneficiaryProfiles: defineTable({
    userId: v.id("users"),
    // Personal information
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    gender: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    stateOfOrigin: v.optional(v.string()),
    lga: v.optional(v.string()),
    profilePictureStorageId: v.optional(v.id("_storage")),
    // Family context
    guardianName: v.optional(v.string()),
    guardianPhone: v.optional(v.string()),
    guardianRelationship: v.optional(v.string()),
    familySize: v.optional(v.number()),
    householdIncome: v.optional(v.string()),
    // Foundation-managed fields
    lifecycleStatus: v.union(
      v.literal("applicant"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("alumni"),
      v.literal("withdrawn"),
    ),
    adminNotes: v.optional(v.string()),
    profileCompletionPercent: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_lifecycleStatus", ["lifecycleStatus"]),

  educationRecords: defineTable({
    userId: v.id("users"),
    stage: v.union(
      v.literal("primary"),
      v.literal("jss"),
      v.literal("sss"),
      v.literal("jamb"),
      v.literal("university"),
      v.literal("polytechnic"),
      v.literal("coe"),
      v.literal("nysc"),
      v.literal("post_nysc"),
    ),
    isCurrent: v.boolean(),
    institutionName: v.optional(v.string()),
    startYear: v.optional(v.number()),
    endYear: v.optional(v.number()),
    qualification: v.optional(v.string()),
    grade: v.optional(v.string()),
    // Stage-specific fields
    jambScore: v.optional(v.number()),
    courseOfStudy: v.optional(v.string()),
    nyscState: v.optional(v.string()),
    nyscPpa: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_stage", ["userId", "stage"])
    .index("by_userId_and_isCurrent", ["userId", "isCurrent"]),

  documents: defineTable({
    ownerId: v.id("users"),
    uploaderId: v.id("users"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    category: v.union(
      v.literal("identity"),
      v.literal("education"),
      v.literal("support_evidence"),
      v.literal("other"),
    ),
    visibility: v.union(
      v.literal("owner_only"),
      v.literal("admin_only"),
      v.literal("owner_and_admin"),
    ),
    linkedProfileId: v.optional(v.id("beneficiaryProfiles")),
    linkedSupportRequestId: v.optional(v.id("supportRequests")),
    description: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_ownerId", ["ownerId"])
    .index("by_ownerId_and_category", ["ownerId", "category"])
    .index("by_uploaderId", ["uploaderId"]),

  supportRequests: defineTable({
    beneficiaryUserId: v.id("users"),
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("tuition"),
      v.literal("books"),
      v.literal("transport"),
      v.literal("medical"),
      v.literal("accommodation"),
      v.literal("upkeep"),
      v.literal("other"),
    ),
    amountRequested: v.optional(v.number()),
    status: v.union(
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
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_beneficiaryUserId", ["beneficiaryUserId"])
    .index("by_status", ["status"]),

  supportRequestEvents: defineTable({
    requestId: v.id("supportRequests"),
    action: v.string(),
    fromStatus: v.string(),
    toStatus: v.string(),
    performedBy: v.id("users"),
    note: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_requestId", ["requestId"]),

  disbursements: defineTable({
    requestId: v.id("supportRequests"),
    amount: v.number(),
    bankReference: v.optional(v.string()),
    transferDate: v.optional(v.number()),
    disbursedBy: v.id("users"),
    evidenceDueDate: v.optional(v.number()),
    evidenceStorageId: v.optional(v.id("_storage")),
    evidenceStatus: v.union(
      v.literal("not_required"),
      v.literal("pending"),
      v.literal("submitted"),
      v.literal("verified"),
      v.literal("overdue"),
    ),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_requestId", ["requestId"])
    .index("by_evidenceStatus", ["evidenceStatus"]),

  sessionEnrollments: defineTable({
    sessionId: v.id("sessions"),
    userId: v.id("users"),
    enrolledAt: v.number(),
    status: v.union(
      v.literal("enrolled"),
      v.literal("dropped"),
    ),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_userId", ["userId"])
    .index("by_sessionId_and_status", ["sessionId", "status"]),

  sessionAttendance: defineTable({
    sessionId: v.id("sessions"),
    userId: v.id("users"),
    status: v.union(
      v.literal("present"),
      v.literal("absent"),
      v.literal("excused"),
    ),
    notes: v.optional(v.string()),
    markedBy: v.id("users"),
    markedAt: v.number(),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_userId", ["userId"])
    .index("by_sessionId_and_userId", ["sessionId", "userId"]),

  libraryCategories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    slug: v.string(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]),

  materials: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("pdf"),
      v.literal("docx"),
      v.literal("youtube"),
      v.literal("link"),
      v.literal("audio"),
    ),
    url: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    pillar: v.optional(v.string()),
    sessionId: v.optional(v.id("sessions")),
    categoryId: v.optional(v.id("libraryCategories")),
    visibility: v.optional(
      v.union(v.literal("public"), v.literal("restricted")),
    ),
    isRequired: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_pillar", ["pillar"])
    .index("by_sessionId", ["sessionId"])
    .index("by_createdBy", ["createdBy"])
    .index("by_categoryId", ["categoryId"])
    .index("by_visibility", ["visibility"]),

  resourceAccess: defineTable({
    materialId: v.id("materials"),
    targetType: v.union(v.literal("cohort"), v.literal("user")),
    cohortId: v.optional(v.id("cohorts")),
    userId: v.optional(v.id("users")),
    grantedBy: v.id("users"),
    grantedAt: v.number(),
  })
    .index("by_materialId", ["materialId"])
    .index("by_userId", ["userId"])
    .index("by_cohortId", ["cohortId"])
    .index("by_materialId_and_targetType", ["materialId", "targetType"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    eventKey: v.string(),
    linkUrl: v.optional(v.string()),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_isRead", ["userId", "isRead"])
    .index("by_eventKey", ["eventKey"]),

  notificationDeliveries: defineTable({
    notificationId: v.id("notifications"),
    userId: v.id("users"),
    channel: v.union(v.literal("in_app"), v.literal("email"), v.literal("sms")),
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("failed"),
      v.literal("skipped"),
    ),
    eventKey: v.string(),
    attemptCount: v.number(),
    lastAttemptAt: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_notificationId", ["notificationId"])
    .index("by_userId", ["userId"])
    .index("by_eventKey", ["eventKey"])
    .index("by_status", ["status"]),

  assessmentTemplates: defineTable({
    name: v.string(),
    shortCode: v.string(),
    version: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived"),
    ),
    // Instrument metadata
    description: v.optional(v.string()),
    sourceCitation: v.optional(v.string()),
    licenseNotes: v.optional(v.string()),
    adaptationNotes: v.optional(v.string()),
    pillar: v.optional(v.string()),
    sessionNumber: v.optional(v.number()),
    // Items (stored as structured array in a single field for immutability)
    items: v.array(
      v.object({
        itemNumber: v.number(),
        text: v.string(),
        subscale: v.optional(v.string()),
        isReversed: v.boolean(),
        responseOptions: v.array(
          v.object({
            label: v.string(),
            value: v.number(),
          }),
        ),
      }),
    ),
    // Scoring config
    scoringMethod: v.optional(v.union(v.literal("sum"), v.literal("average"), v.literal("mean"))),
    subscaleOnly: v.optional(v.boolean()), // true for MLQ, AGQ-R (no total score)
    subscales: v.optional(
      v.array(
        v.object({
          name: v.string(),
          itemNumbers: v.array(v.number()),
          scoringMethod: v.optional(v.union(v.literal("sum"), v.literal("average"))),
        }),
      ),
    ),
    severityBands: v.optional(
      v.array(
        v.object({
          label: v.string(),
          min: v.number(),
          max: v.number(),
          flagBehavior: v.optional(
            v.union(v.literal("none"), v.literal("mentor_notify"), v.literal("admin_review")),
          ),
        }),
      ),
    ),
    // Severity bands for subscales (for MLQ 2x2 matrix interpretation)
    subscaleSeverityBands: v.optional(
      v.array(
        v.object({
          subscaleName: v.string(),
          bands: v.array(
            v.object({
              label: v.string(),
              min: v.number(),
              max: v.number(),
              flagBehavior: v.optional(
                v.union(v.literal("none"), v.literal("mentor_notify"), v.literal("admin_review")),
              ),
            }),
          ),
        }),
      ),
    ),
    // Platform display texts keyed by severity band label
    platformDisplayTexts: v.optional(v.record(v.string(), v.string())),
    totalScoreRange: v.optional(
      v.object({
        min: v.number(),
        max: v.number(),
      }),
    ),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_shortCode", ["shortCode"])
    .index("by_status", ["status"])
    .index("by_shortCode_and_version", ["shortCode", "version"]),

  assessmentAssignments: defineTable({
    templateId: v.id("assessmentTemplates"),
    userId: v.id("users"),
    sessionId: v.optional(v.id("sessions")),
    assignedBy: v.id("users"),
    dueDate: v.optional(v.number()),
    status: v.union(
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("overdue"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_status", ["userId", "status"])
    .index("by_templateId", ["templateId"])
    .index("by_sessionId", ["sessionId"])
    .index("by_status", ["status"]),

  assessmentResponses: defineTable({
    assignmentId: v.id("assessmentAssignments"),
    userId: v.id("users"),
    templateId: v.id("assessmentTemplates"),
    answers: v.record(v.string(), v.number()),
    isSubmitted: v.boolean(),
    submittedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_assignmentId", ["assignmentId"])
    .index("by_userId", ["userId"]),

  assessmentScores: defineTable({
    responseId: v.id("assessmentResponses"),
    assignmentId: v.id("assessmentAssignments"),
    userId: v.id("users"),
    templateId: v.id("assessmentTemplates"),
    totalScore: v.optional(v.number()),
    subscaleScores: v.optional(v.record(v.string(), v.number())),
    severityBand: v.optional(v.string()),
    platformDisplayText: v.optional(v.string()),
    flagBehavior: v.optional(
      v.union(v.literal("none"), v.literal("mentor_notify"), v.literal("admin_review")),
    ),
    interpretation: v.optional(v.string()),
    scoredAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_assignmentId", ["assignmentId"])
    .index("by_templateId", ["templateId"])
    .index("by_flagBehavior", ["flagBehavior"]),

  safeguardingActions: defineTable({
    scoreId: v.id("assessmentScores"),
    userId: v.id("users"),
    assignedTo: v.optional(v.id("users")),
    flagBehavior: v.union(
      v.literal("mentor_notify"),
      v.literal("admin_review"),
    ),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("dismissed"),
    ),
    recommendedAction: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    resolutionNote: v.optional(v.string()),
    resolvedBy: v.optional(v.id("users")),
    resolvedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_assignedTo", ["assignedTo"])
    .index("by_scoreId", ["scoreId"]),

  mentorNotes: defineTable({
    mentorId: v.id("users"),
    beneficiaryUserId: v.id("users"),
    content: v.string(),
    visibility: v.union(
      v.literal("mentor_only"),
      v.literal("mentor_and_admin"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_mentorId", ["mentorId"])
    .index("by_beneficiaryUserId", ["beneficiaryUserId"])
    .index("by_mentorId_and_beneficiaryUserId", [
      "mentorId",
      "beneficiaryUserId",
    ]),

  auditLogs: defineTable({
    userId: v.id("users"),
    action: v.string(),
    resource: v.string(),
    resourceId: v.optional(v.string()),
    details: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_action", ["action"])
    .index("by_resource", ["resource"]),

  // ─── Messaging ───

  conversations: defineTable({
    type: v.union(v.literal("direct"), v.literal("group")),
    name: v.optional(v.string()),
    lastMessagePreview: v.optional(v.string()),
    lastMessageAt: v.optional(v.number()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_lastMessageAt", ["lastMessageAt"]),

  conversationParticipants: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    lastReadAt: v.number(),
    joinedAt: v.number(),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_userId", ["userId"])
    .index("by_userId_and_conversationId", ["userId", "conversationId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    type: v.union(
      v.literal("text"),
      v.literal("file"),
      v.literal("link"),
      v.literal("video_link"),
    ),
    body: v.string(),
    fileStorageId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
    fileType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    linkUrl: v.optional(v.string()),
    isDeleted: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_conversationId_and_createdAt", ["conversationId", "createdAt"]),
});

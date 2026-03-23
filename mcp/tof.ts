import { ConvexHttpClient } from "convex/browser";
import type {
  FunctionReference,
  FunctionReturnType,
  OptionalRestArgs,
} from "convex/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";
import { internal } from "../convex/_generated/api";
import {
  ROLES,
  SESSION_STATUSES,
  COHORT_MEMBERSHIP_STATUSES,
  SUPPORT_REQUEST_STATUSES,
  SUPPORT_CATEGORIES,
  SAFEGUARDING_STATUSES,
} from "./constants";

const DEFAULT_VERSION = "0.1.0";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AdminConvexClient = ConvexHttpClient & {
  setAdminAuth(token: string): void;
  query<Query extends FunctionReference<"query", "public" | "internal">>(
    query: Query,
    ...args: OptionalRestArgs<Query>
  ): Promise<FunctionReturnType<Query>>;
  mutation<
    Mutation extends FunctionReference<"mutation", "public" | "internal">,
  >(
    mutation: Mutation,
    ...args: OptionalRestArgs<Mutation>
  ): Promise<FunctionReturnType<Mutation>>;
};

type TofServerProfile = "local" | "remote";

type CreateTofServerOptions = {
  name: string;
  profile: TofServerProfile;
  version?: string;
};

// ---------------------------------------------------------------------------
// Zod enums
// ---------------------------------------------------------------------------

const roleEnum = z.enum(ROLES);
const sessionStatusEnum = z.enum(SESSION_STATUSES);
const cohortMembershipStatusEnum = z.enum(COHORT_MEMBERSHIP_STATUSES);
const supportRequestStatusEnum = z.enum(SUPPORT_REQUEST_STATUSES);
const supportCategoryEnum = z.enum(SUPPORT_CATEGORIES);
const safeguardingStatusEnum = z.enum(SAFEGUARDING_STATUSES);
const messageTypeEnum = z.enum(["text", "link", "video_link"]);

// ---------------------------------------------------------------------------
// Environment helpers
// ---------------------------------------------------------------------------

function getConvexUrl() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_CONVEX_URL. Add it to the environment before running the MCP server.",
    );
  }
  return url;
}

function getAdminKey() {
  const key =
    process.env.CONVEX_DEPLOY_KEY ??
    process.env.TOF_MCP_CONVEX_DEPLOY_KEY;
  if (!key) {
    throw new Error(
      "Missing CONVEX_DEPLOY_KEY. Generate a development deploy key in Convex and add it to the environment.",
    );
  }
  return key;
}

function getActorEmail() {
  return process.env.TOF_MCP_ACTOR_EMAIL?.trim() || null;
}

function requireActorEmail() {
  const actorEmail = getActorEmail();
  if (!actorEmail) {
    throw new Error(
      "Missing TOF_MCP_ACTOR_EMAIL. Set it in the environment to enable write tools.",
    );
  }
  return actorEmail;
}

// ---------------------------------------------------------------------------
// Client & helpers
// ---------------------------------------------------------------------------

function createClient() {
  const client = new ConvexHttpClient(getConvexUrl(), {
    logger: false,
  }) as AdminConvexClient;
  client.setAdminAuth(getAdminKey());
  return client;
}

function toIso(value: number | undefined | null) {
  if (!value) return null;
  return new Date(value).toISOString();
}

function jsonResult<T>(data: T) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
    structuredContent: data,
  };
}

function readOnlyAnnotations() {
  return {
    readOnlyHint: true,
    destructiveHint: false,
    openWorldHint: false,
  };
}

function destructiveAnnotations() {
  return {
    readOnlyHint: false,
    destructiveHint: true,
    openWorldHint: false,
  };
}

function parseIsoToEpoch(isoDate: string | undefined): number | undefined {
  if (!isoDate) return undefined;
  return new Date(isoDate).getTime();
}

// ===========================================================================
// Tool Registration
// ===========================================================================

function registerReadTools(server: McpServer) {
  // 1. get_platform_dashboard
  server.registerTool(
    "get_platform_dashboard",
    {
      description:
        "Return a platform-wide dashboard summary including user counts by role, cohort overview, financial summary, open safeguarding count, and recent audit logs.",
      annotations: readOnlyAnnotations(),
      inputSchema: {
        activityLimit: z
          .number()
          .int()
          .min(1)
          .max(20)
          .default(10)
          .describe("Number of recent audit log entries to include"),
      },
    },
    async ({ activityLimit }) => {
      const client = createClient();
      const dashboard = await client.query(internal.mcp.getPlatformDashboard, {
        activityLimit,
      });

      return jsonResult({
        ...dashboard,
        recentAuditLogs: dashboard.recentAuditLogs.map((log) => ({
          ...log,
          createdAt: toIso(log.createdAt),
        })),
      });
    },
  );

  // 2. list_users
  server.registerTool(
    "list_users",
    {
      description:
        "List platform users, optionally filtered by role and/or active status.",
      annotations: readOnlyAnnotations(),
      inputSchema: {
        role: roleEnum.optional().describe("Filter by role"),
        isActive: z.boolean().optional().describe("Filter by active status"),
        limit: z.number().int().min(1).max(200).default(50),
      },
    },
    async ({ role, isActive, limit }) => {
      const client = createClient();
      const users = await client.query(internal.mcp.listUsers, {
        role,
        isActive,
        limit,
      });

      return jsonResult({
        users: users.map((u) => ({
          ...u,
          createdAt: toIso(u.createdAt),
        })),
      });
    },
  );

  // 3. search_beneficiaries
  server.registerTool(
    "search_beneficiaries",
    {
      description:
        "Search beneficiaries by name or email. Returns matching users with their profile status.",
      annotations: readOnlyAnnotations(),
      inputSchema: {
        query: z.string().min(1).describe("Name or email to search for"),
        limit: z.number().int().min(1).max(50).default(20),
      },
    },
    async ({ query, limit }) => {
      const client = createClient();
      const results = await client.query(internal.mcp.searchBeneficiaries, {
        search: query,
        limit,
      });

      return jsonResult({
        beneficiaries: results.map((b) => ({
          ...b,
          createdAt: toIso(b.createdAt),
        })),
      });
    },
  );

  // 4. get_beneficiary_profile
  server.registerTool(
    "get_beneficiary_profile",
    {
      description:
        "Return the full development profile for a beneficiary: personal info, education, attendance, assessment scores, mentor, support requests, and cohort memberships.",
      annotations: readOnlyAnnotations(),
      inputSchema: {
        userId: z.string().describe("The Convex user ID of the beneficiary"),
      },
    },
    async ({ userId }) => {
      const client = createClient();
      const profile = await client.query(internal.mcp.getBeneficiaryProfile, {
        userId: userId as never,
      });

      return jsonResult({
        ...profile,
        user: {
          ...profile.user,
          createdAt: toIso(profile.user.createdAt),
        },
        assessmentScores: profile.assessmentScores.map((s) => ({
          ...s,
          scoredAt: toIso(s.scoredAt),
        })),
        mentor: profile.mentor
          ? {
              ...profile.mentor,
              assignedAt: toIso(profile.mentor.assignedAt),
            }
          : null,
        supportRequests: profile.supportRequests.map((r) => ({
          ...r,
          createdAt: toIso(r.createdAt),
        })),
        cohortMemberships: profile.cohortMemberships.map((m) => ({
          ...m,
          joinedAt: toIso(m.joinedAt),
        })),
      });
    },
  );

  // 5. list_cohorts
  server.registerTool(
    "list_cohorts",
    {
      description:
        "List all cohorts with member counts and session counts.",
      annotations: readOnlyAnnotations(),
      inputSchema: {
        limit: z.number().int().min(1).max(50).default(20),
      },
    },
    async ({ limit }) => {
      const client = createClient();
      const cohorts = await client.query(internal.mcp.listCohorts, { limit });

      return jsonResult({
        cohorts: cohorts.map((c) => ({
          ...c,
          startDate: toIso(c.startDate),
          endDate: toIso(c.endDate),
          createdAt: toIso(c.createdAt),
        })),
      });
    },
  );

  // 6. get_cohort_details
  server.registerTool(
    "get_cohort_details",
    {
      description:
        "Return detailed information for a cohort: members list with status, sessions list with facilitator and enrollment counts.",
      annotations: readOnlyAnnotations(),
      inputSchema: {
        cohortId: z.string().describe("The Convex ID of the cohort"),
      },
    },
    async ({ cohortId }) => {
      const client = createClient();
      const details = await client.query(internal.mcp.getCohortDetails, {
        cohortId: cohortId as never,
      });

      return jsonResult({
        cohort: {
          ...details.cohort,
          startDate: toIso(details.cohort.startDate),
          endDate: toIso(details.cohort.endDate),
          createdAt: toIso(details.cohort.createdAt),
        },
        members: details.members.map((m) => ({
          ...m,
          joinedAt: toIso(m.joinedAt),
        })),
        sessions: details.sessions.map((s) => ({
          ...s,
          scheduledDate: toIso(s.scheduledDate),
        })),
      });
    },
  );

  // 7. list_sessions
  server.registerTool(
    "list_sessions",
    {
      description:
        "List sessions optionally filtered by status or cohort. Includes facilitator name and enrollment count.",
      annotations: readOnlyAnnotations(),
      inputSchema: {
        status: sessionStatusEnum.optional().describe("Filter by session status"),
        cohortId: z.string().optional().describe("Filter by cohort ID"),
        limit: z.number().int().min(1).max(100).default(50),
      },
    },
    async ({ status, cohortId, limit }) => {
      const client = createClient();
      const sessions = await client.query(internal.mcp.listSessions, {
        status,
        cohortId: cohortId as never,
        limit,
      });

      return jsonResult({
        sessions: sessions.map((s) => ({
          ...s,
          scheduledDate: toIso(s.scheduledDate),
          createdAt: toIso(s.createdAt),
        })),
      });
    },
  );

  // 8. list_support_requests
  server.registerTool(
    "list_support_requests",
    {
      description:
        "List support requests optionally filtered by status. Includes beneficiary name and email.",
      annotations: readOnlyAnnotations(),
      inputSchema: {
        status: supportRequestStatusEnum
          .optional()
          .describe("Filter by request status"),
        limit: z.number().int().min(1).max(100).default(50),
      },
    },
    async ({ status, limit }) => {
      const client = createClient();
      const requests = await client.query(internal.mcp.listSupportRequests, {
        status,
        limit,
      });

      return jsonResult({
        requests: requests.map((r) => ({
          ...r,
          createdAt: toIso(r.createdAt),
          updatedAt: toIso(r.updatedAt),
        })),
      });
    },
  );

  // 9. get_support_request_details
  server.registerTool(
    "get_support_request_details",
    {
      description:
        "Return a full support request record including beneficiary details, event history, and disbursements.",
      annotations: readOnlyAnnotations(),
      inputSchema: {
        requestId: z.string().describe("The Convex support request ID"),
      },
    },
    async ({ requestId }) => {
      const client = createClient();
      const details = await client.query(internal.mcp.getSupportRequestDetails, {
        requestId: requestId as never,
      });

      if (!details) {
        return jsonResult({ request: null });
      }

      return jsonResult({
        request: {
          ...details.request,
          createdAt: toIso(details.request.createdAt),
          updatedAt: toIso(details.request.updatedAt),
        },
        beneficiary: details.beneficiary,
        events: details.events.map((event) => ({
          ...event,
          createdAt: toIso(event.createdAt),
        })),
        disbursements: details.disbursements.map((disbursement) => ({
          ...disbursement,
          transferDate: toIso(disbursement.transferDate),
          evidenceDueDate: toIso(disbursement.evidenceDueDate),
          createdAt: toIso(disbursement.createdAt),
          updatedAt: toIso(disbursement.updatedAt),
        })),
      });
    },
  );

  // 10. get_financial_summary
  server.registerTool(
    "get_financial_summary",
    {
      description:
        "Return the financial summary: total amount disbursed, evidence status counts, pending and under-review request counts.",
      annotations: readOnlyAnnotations(),
      inputSchema: {},
    },
    async () => {
      const client = createClient();
      const summary = await client.query(internal.mcp.getFinancialSummary, {});
      return jsonResult(summary);
    },
  );

  // 11. list_flagged_assessments
  server.registerTool(
    "list_flagged_assessments",
    {
      description:
        "List assessment scores that triggered safeguarding flags (mentor_notify or admin_review). Includes user name, template info, and safeguarding action status.",
      annotations: readOnlyAnnotations(),
      inputSchema: {
        flagFilter: z
          .enum(["mentor_notify", "admin_review"])
          .optional()
          .describe("Filter by flag type"),
        limit: z.number().int().min(1).max(100).default(50),
      },
    },
    async ({ flagFilter, limit }) => {
      const client = createClient();
      const flagged = await client.query(internal.mcp.listFlaggedAssessments, {
        flagFilter,
        limit,
      });

      return jsonResult({
        flaggedScores: flagged.map((f) => ({
          ...f,
          scoredAt: toIso(f.scoredAt),
        })),
      });
    },
  );

  // 12. list_safeguarding_actions
  server.registerTool(
    "list_safeguarding_actions",
    {
      description:
        "List safeguarding actions (concerns flagged from assessment scores). Optionally filter by status.",
      annotations: readOnlyAnnotations(),
      inputSchema: {
        status: safeguardingStatusEnum
          .optional()
          .describe("Filter by status (open, in_progress, resolved, dismissed)"),
        limit: z.number().int().min(1).max(100).default(50),
      },
    },
    async ({ status, limit }) => {
      const client = createClient();
      const actions = await client.query(internal.mcp.listSafeguardingActions, {
        status,
        limit,
      });

      return jsonResult({
        actions: actions.map((a) => ({
          ...a,
          createdAt: toIso(a.createdAt),
          updatedAt: toIso(a.updatedAt),
        })),
      });
    },
  );

  // 13. list_audit_logs
  server.registerTool(
    "list_audit_logs",
    {
      description:
        "View recent audit log entries. Optionally filter by action type (e.g., update_user_role, create_cohort).",
      annotations: readOnlyAnnotations(),
      inputSchema: {
        action: z
          .string()
          .optional()
          .describe(
            "Filter by action type (e.g., update_user_role, create_session)",
          ),
        limit: z.number().int().min(1).max(100).default(50),
      },
    },
    async ({ action, limit }) => {
      const client = createClient();
      const logs = await client.query(internal.mcp.listAuditLogs, {
        action,
        limit,
      });

      return jsonResult({
        logs: logs.map((l) => ({
          ...l,
          createdAt: toIso(l.createdAt),
        })),
      });
    },
  );

  // 14. list_message_conversations
  server.registerTool(
    "list_message_conversations",
    {
      description:
        "List the admin actor's message conversations, optionally filtered by the other participant's role.",
      annotations: readOnlyAnnotations(),
      inputSchema: {
        role: roleEnum
          .optional()
          .describe("Filter by the other participant's role, for example beneficiary"),
        limit: z.number().int().min(1).max(100).default(50),
      },
    },
    async ({ role, limit }) => {
      const actorEmail = requireActorEmail();
      const client = createClient();
      const conversations = await client.query(internal.mcp.listMessageConversations, {
        actorEmail,
        role,
        limit,
      });

      return jsonResult({
        actorEmail,
        conversations: conversations.map((conversation) => ({
          ...conversation,
          lastMessageAt: toIso(conversation.lastMessageAt),
        })),
      });
    },
  );

  // 15. get_conversation_messages
  server.registerTool(
    "get_conversation_messages",
    {
      description:
        "Read messages from a specific conversation available to the admin actor.",
      annotations: readOnlyAnnotations(),
      inputSchema: {
        conversationId: z.string().describe("The Convex conversation ID"),
        limit: z.number().int().min(1).max(200).default(100),
      },
    },
    async ({ conversationId, limit }) => {
      const actorEmail = requireActorEmail();
      const client = createClient();
      const conversation = await client.query(internal.mcp.getConversationMessages, {
        actorEmail,
        conversationId: conversationId as never,
        limit,
      });

      return jsonResult({
        actorEmail,
        conversation: {
          ...conversation.conversation,
          lastMessageAt: toIso(conversation.conversation.lastMessageAt),
        },
        participants: conversation.participants,
        messages: conversation.messages.map((message) => ({
          ...message,
          createdAt: toIso(message.createdAt),
        })),
      });
    },
  );
}

function registerWriteTools(server: McpServer) {
  // 13. update_user_role
  server.registerTool(
    "update_user_role",
    {
      description:
        "Change a user's role. Valid roles: admin, facilitator, mentor, beneficiary.",
      annotations: destructiveAnnotations(),
      inputSchema: {
        userId: z.string().describe("The Convex user ID"),
        role: roleEnum.describe("The new role to assign"),
      },
    },
    async ({ userId, role }) => {
      const actorEmail = requireActorEmail();
      const client = createClient();
      const result = await client.mutation(internal.mcp.updateUserRole, {
        actorEmail,
        userId: userId as never,
        role,
      });
      return jsonResult({ ...result, actorEmail });
    },
  );

  // 14. toggle_user_active
  server.registerTool(
    "toggle_user_active",
    {
      description: "Activate or deactivate a user account.",
      annotations: destructiveAnnotations(),
      inputSchema: {
        userId: z.string().describe("The Convex user ID"),
        isActive: z.boolean().describe("true to activate, false to deactivate"),
      },
    },
    async ({ userId, isActive }) => {
      const actorEmail = requireActorEmail();
      const client = createClient();
      const result = await client.mutation(internal.mcp.toggleUserActive, {
        actorEmail,
        userId: userId as never,
        isActive,
      });
      return jsonResult({ ...result, actorEmail });
    },
  );

  // 15. create_cohort
  server.registerTool(
    "create_cohort",
    {
      description: "Create a new cohort for beneficiary grouping.",
      annotations: destructiveAnnotations(),
      inputSchema: {
        name: z.string().min(1).describe("Cohort name"),
        description: z.string().optional().describe("Cohort description"),
        startDateIso: z
          .string()
          .datetime({ offset: true })
          .optional()
          .describe("Start date as ISO timestamp"),
        endDateIso: z
          .string()
          .datetime({ offset: true })
          .optional()
          .describe("End date as ISO timestamp"),
      },
    },
    async ({ name, description, startDateIso, endDateIso }) => {
      const actorEmail = requireActorEmail();
      const client = createClient();
      const result = await client.mutation(internal.mcp.createCohort, {
        actorEmail,
        name,
        description,
        startDate: parseIsoToEpoch(startDateIso),
        endDate: parseIsoToEpoch(endDateIso),
      });
      return jsonResult({ ...result, actorEmail });
    },
  );

  // 16. update_cohort
  server.registerTool(
    "update_cohort",
    {
      description:
        "Update cohort details: name, description, dates, or active status.",
      annotations: destructiveAnnotations(),
      inputSchema: {
        cohortId: z.string().describe("The Convex cohort ID"),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        startDateIso: z.string().datetime({ offset: true }).optional(),
        endDateIso: z.string().datetime({ offset: true }).optional(),
        isActive: z.boolean().optional(),
      },
    },
    async ({ cohortId, name, description, startDateIso, endDateIso, isActive }) => {
      const actorEmail = requireActorEmail();
      const client = createClient();
      const result = await client.mutation(internal.mcp.updateCohort, {
        actorEmail,
        cohortId: cohortId as never,
        name,
        description,
        startDate: parseIsoToEpoch(startDateIso),
        endDate: parseIsoToEpoch(endDateIso),
        isActive,
      });
      return jsonResult({ ...result, actorEmail });
    },
  );

  // 17. add_cohort_member
  server.registerTool(
    "add_cohort_member",
    {
      description:
        "Add a user to a cohort. Checks for duplicates. Default status is 'active'.",
      annotations: destructiveAnnotations(),
      inputSchema: {
        cohortId: z.string().describe("The Convex cohort ID"),
        userId: z.string().describe("The Convex user ID to add"),
        status: cohortMembershipStatusEnum
          .optional()
          .describe("Membership status (default: active)"),
      },
    },
    async ({ cohortId, userId, status }) => {
      const actorEmail = requireActorEmail();
      const client = createClient();
      const result = await client.mutation(internal.mcp.addCohortMember, {
        actorEmail,
        cohortId: cohortId as never,
        userId: userId as never,
        status,
      });
      return jsonResult({ ...result, actorEmail });
    },
  );

  // 18. create_session
  server.registerTool(
    "create_session",
    {
      description:
        "Create a new training session. Provide session number, title, and pillar at minimum.",
      annotations: destructiveAnnotations(),
      inputSchema: {
        sessionNumber: z.number().int().describe("Session number (e.g. 1, 2, 3)"),
        title: z.string().min(1).describe("Session title"),
        pillar: z.string().min(1).describe("Thematic pillar"),
        description: z.string().optional(),
        scheduledDateIso: z
          .string()
          .datetime({ offset: true })
          .optional()
          .describe("Scheduled date as ISO timestamp"),
        facilitatorId: z.string().optional().describe("Facilitator user ID"),
        cohortId: z.string().optional().describe("Cohort ID to associate"),
        status: sessionStatusEnum.optional().describe("Status (default: draft)"),
      },
    },
    async ({
      sessionNumber,
      title,
      pillar,
      description,
      scheduledDateIso,
      facilitatorId,
      cohortId,
      status,
    }) => {
      const actorEmail = requireActorEmail();
      const client = createClient();
      const result = await client.mutation(internal.mcp.createSession, {
        actorEmail,
        sessionNumber,
        title,
        pillar,
        description,
        scheduledDate: parseIsoToEpoch(scheduledDateIso),
        facilitatorId: facilitatorId as never,
        cohortId: cohortId as never,
        status,
      });
      return jsonResult({ ...result, actorEmail });
    },
  );

  // 19. update_session
  server.registerTool(
    "update_session",
    {
      description:
        "Update session details: title, pillar, description, date, facilitator, cohort, or status.",
      annotations: destructiveAnnotations(),
      inputSchema: {
        sessionId: z.string().describe("The Convex session ID"),
        title: z.string().optional(),
        pillar: z.string().optional(),
        description: z.string().optional(),
        scheduledDateIso: z.string().datetime({ offset: true }).optional(),
        facilitatorId: z.string().optional().describe("Facilitator user ID"),
        cohortId: z.string().optional().describe("Cohort ID"),
        status: sessionStatusEnum.optional(),
      },
    },
    async ({
      sessionId,
      title,
      pillar,
      description,
      scheduledDateIso,
      facilitatorId,
      cohortId,
      status,
    }) => {
      const actorEmail = requireActorEmail();
      const client = createClient();
      const result = await client.mutation(internal.mcp.updateSession, {
        actorEmail,
        sessionId: sessionId as never,
        title,
        pillar,
        description,
        scheduledDate: parseIsoToEpoch(scheduledDateIso),
        facilitatorId: facilitatorId as never,
        cohortId: cohortId as never,
        status,
      });
      return jsonResult({ ...result, actorEmail });
    },
  );

  // 20. enroll_cohort_in_session
  server.registerTool(
    "enroll_cohort_in_session",
    {
      description:
        "Bulk-enroll all active cohort members into a session. Skips already-enrolled users.",
      annotations: destructiveAnnotations(),
      inputSchema: {
        sessionId: z.string().describe("The Convex session ID"),
        cohortId: z.string().describe("The Convex cohort ID"),
      },
    },
    async ({ sessionId, cohortId }) => {
      const actorEmail = requireActorEmail();
      const client = createClient();
      const result = await client.mutation(internal.mcp.enrollCohortInSession, {
        actorEmail,
        sessionId: sessionId as never,
        cohortId: cohortId as never,
      });
      return jsonResult({ ...result, actorEmail });
    },
  );

  // 21. assign_assessment
  server.registerTool(
    "assign_assessment",
    {
      description:
        "Assign an assessment template to a user or all enrolled users in a session. Provide either userId or sessionId.",
      annotations: destructiveAnnotations(),
      inputSchema: {
        templateId: z.string().describe("The Convex assessment template ID"),
        userId: z
          .string()
          .optional()
          .describe("Assign to a single user (provide userId OR sessionId)"),
        sessionId: z
          .string()
          .optional()
          .describe(
            "Assign to all enrolled users in a session (provide userId OR sessionId)",
          ),
        dueDateIso: z
          .string()
          .datetime({ offset: true })
          .optional()
          .describe("Due date as ISO timestamp"),
      },
    },
    async ({ templateId, userId, sessionId, dueDateIso }) => {
      const actorEmail = requireActorEmail();
      const client = createClient();
      const result = await client.mutation(internal.mcp.assignAssessment, {
        actorEmail,
        templateId: templateId as never,
        userId: userId as never,
        sessionId: sessionId as never,
        dueDate: parseIsoToEpoch(dueDateIso),
      });
      return jsonResult({ ...result, actorEmail });
    },
  );

  // 22. create_support_request
  server.registerTool(
    "create_support_request",
    {
      description:
        "Create a support request for a beneficiary as the configured admin actor.",
      annotations: destructiveAnnotations(),
      inputSchema: {
        beneficiaryUserId: z
          .string()
          .describe("The Convex user ID of the beneficiary"),
        title: z.string().min(1).describe("Support request title"),
        description: z.string().min(1).describe("Support request description"),
        category: supportCategoryEnum.describe("Support request category"),
        amountRequested: z
          .number()
          .positive()
          .optional()
          .describe("Requested amount, if applicable"),
      },
    },
    async ({
      beneficiaryUserId,
      title,
      description,
      category,
      amountRequested,
    }) => {
      const actorEmail = requireActorEmail();
      const client = createClient();
      const result = await client.mutation(internal.mcp.createSupportRequest, {
        actorEmail,
        beneficiaryUserId: beneficiaryUserId as never,
        title,
        description,
        category,
        amountRequested,
      });
      return jsonResult({ ...result, actorEmail });
    },
  );

  // 23. update_support_request_status
  server.registerTool(
    "update_support_request_status",
    {
      description:
        "Update a support request status using the platform's valid transition rules.",
      annotations: destructiveAnnotations(),
      inputSchema: {
        requestId: z.string().describe("The Convex support request ID"),
        toStatus: supportRequestStatusEnum.describe("Target status"),
        note: z
          .string()
          .optional()
          .describe("Optional note explaining the status change"),
      },
    },
    async ({ requestId, toStatus, note }) => {
      const actorEmail = requireActorEmail();
      const client = createClient();
      const result = await client.mutation(
        internal.mcp.transitionSupportRequest,
        {
          actorEmail,
          requestId: requestId as never,
          toStatus,
          note,
        },
      );
      return jsonResult({ ...result, actorEmail });
    },
  );

  // 24. approve_support_request
  server.registerTool(
    "approve_support_request",
    {
      description:
        "Approve a support request. Use this when the request is already under review.",
      annotations: destructiveAnnotations(),
      inputSchema: {
        requestId: z.string().describe("The Convex support request ID"),
        note: z
          .string()
          .optional()
          .describe("Optional approval note"),
      },
    },
    async ({ requestId, note }) => {
      const actorEmail = requireActorEmail();
      const client = createClient();
      const result = await client.mutation(
        internal.mcp.transitionSupportRequest,
        {
          actorEmail,
          requestId: requestId as never,
          toStatus: "approved",
          note,
        },
      );
      return jsonResult({ ...result, actorEmail });
    },
  );

  // 25. transition_support_request
  server.registerTool(
    "transition_support_request",
    {
      description:
        "Move a support request to a new status. Valid transitions: submitted→under_review, under_review→approved/declined, approved→disbursed, etc.",
      annotations: destructiveAnnotations(),
      inputSchema: {
        requestId: z.string().describe("The Convex support request ID"),
        toStatus: supportRequestStatusEnum.describe("Target status"),
        note: z
          .string()
          .optional()
          .describe("Optional note explaining the transition"),
      },
    },
    async ({ requestId, toStatus, note }) => {
      const actorEmail = requireActorEmail();
      const client = createClient();
      const result = await client.mutation(
        internal.mcp.transitionSupportRequest,
        {
          actorEmail,
          requestId: requestId as never,
          toStatus,
          note,
        },
      );
      return jsonResult({ ...result, actorEmail });
    },
  );

  // 26. assign_mentor
  server.registerTool(
    "assign_mentor",
    {
      description:
        "Assign a mentor to a beneficiary. If the beneficiary already has an active mentor, the previous assignment is deactivated.",
      annotations: destructiveAnnotations(),
      inputSchema: {
        mentorId: z.string().describe("The Convex user ID of the mentor"),
        beneficiaryUserId: z
          .string()
          .describe("The Convex user ID of the beneficiary"),
      },
    },
    async ({ mentorId, beneficiaryUserId }) => {
      const actorEmail = requireActorEmail();
      const client = createClient();
      const result = await client.mutation(internal.mcp.assignMentor, {
        actorEmail,
        mentorId: mentorId as never,
        beneficiaryUserId: beneficiaryUserId as never,
      });
      return jsonResult({ ...result, actorEmail });
    },
  );

  // 27. resolve_safeguarding_action
  server.registerTool(
    "resolve_safeguarding_action",
    {
      description:
        "Update or resolve a safeguarding action. Set status to 'resolved' or 'dismissed' to close it.",
      annotations: destructiveAnnotations(),
      inputSchema: {
        actionId: z.string().describe("The Convex safeguarding action ID"),
        status: safeguardingStatusEnum.optional().describe("New status"),
        recommendedAction: z.string().optional().describe("Recommended next steps"),
        resolutionNote: z.string().optional().describe("Resolution notes"),
        assignedTo: z
          .string()
          .optional()
          .describe("Assign to a specific user ID (e.g., a mentor)"),
      },
    },
    async ({ actionId, status, recommendedAction, resolutionNote, assignedTo }) => {
      const actorEmail = requireActorEmail();
      const client = createClient();
      const result = await client.mutation(
        internal.mcp.resolveSafeguardingAction,
        {
          actorEmail,
          actionId: actionId as never,
          status,
          recommendedAction,
          resolutionNote,
          assignedTo: assignedTo as never,
        },
      );
      return jsonResult({ ...result, actorEmail });
    },
  );

  // 28. create_disbursement
  server.registerTool(
    "create_disbursement",
    {
      description:
        "Create a disbursement for an approved support request. Automatically transitions the request to 'disbursed' status.",
      annotations: destructiveAnnotations(),
      inputSchema: {
        requestId: z
          .string()
          .describe("The Convex support request ID (must be 'approved')"),
        amount: z.number().positive().describe("Amount to disburse"),
        bankReference: z.string().optional().describe("Bank reference number"),
        transferDateIso: z
          .string()
          .datetime({ offset: true })
          .optional()
          .describe("Transfer date as ISO timestamp"),
        evidenceDueDateIso: z
          .string()
          .datetime({ offset: true })
          .optional()
          .describe("Evidence due date as ISO timestamp (omit if evidence not required)"),
        notes: z.string().optional().describe("Disbursement notes"),
      },
    },
    async ({
      requestId,
      amount,
      bankReference,
      transferDateIso,
      evidenceDueDateIso,
      notes,
    }) => {
      const actorEmail = requireActorEmail();
      const client = createClient();
      const result = await client.mutation(internal.mcp.createDisbursement, {
        actorEmail,
        requestId: requestId as never,
        amount,
        bankReference,
        transferDate: parseIsoToEpoch(transferDateIso),
        evidenceDueDate: parseIsoToEpoch(evidenceDueDateIso),
        notes,
      });
      return jsonResult({ ...result, actorEmail });
    },
  );

  // 29. send_direct_message
  server.registerTool(
    "send_direct_message",
    {
      description:
        "Send a direct message from the configured admin actor to a user, creating the conversation if needed.",
      annotations: destructiveAnnotations(),
      inputSchema: {
        otherUserId: z.string().describe("The Convex user ID of the recipient"),
        body: z.string().min(1).describe("Message body"),
        type: messageTypeEnum
          .optional()
          .describe("Message type. Defaults to text."),
        linkUrl: z
          .string()
          .url()
          .optional()
          .describe("Optional link URL for link or video_link messages"),
      },
    },
    async ({ otherUserId, body, type, linkUrl }) => {
      const actorEmail = requireActorEmail();
      const client = createClient();
      const result = await client.mutation(internal.mcp.sendDirectMessage, {
        actorEmail,
        otherUserId: otherUserId as never,
        body,
        type,
        linkUrl,
      });
      return jsonResult({ ...result, actorEmail });
    },
  );
}

// ===========================================================================
// Server Factory & Self-Check
// ===========================================================================

export function createTofServer(options: CreateTofServerOptions) {
  const server = new McpServer({
    name: options.name,
    version: options.version ?? DEFAULT_VERSION,
  });

  registerReadTools(server);
  registerWriteTools(server);

  return server;
}

export async function runSelfCheck() {
  console.error("TOF MCP self-check starting...");

  try {
    getConvexUrl();
    console.error("  ✓ NEXT_PUBLIC_CONVEX_URL is set");
  } catch {
    console.error("  ✗ NEXT_PUBLIC_CONVEX_URL is missing");
    process.exit(1);
  }

  try {
    getAdminKey();
    console.error("  ✓ CONVEX_DEPLOY_KEY is set");
  } catch {
    console.error("  ✗ CONVEX_DEPLOY_KEY is missing");
    process.exit(1);
  }

  const actorEmail = getActorEmail();
  if (actorEmail) {
    console.error(`  ✓ TOF_MCP_ACTOR_EMAIL is set: ${actorEmail}`);
  } else {
    console.error("  ⚠ TOF_MCP_ACTOR_EMAIL is not set (write tools disabled)");
  }

  console.error("\nConnecting to Convex...");
  try {
    const client = createClient();
    const dashboard = await client.query(internal.mcp.getPlatformDashboard, {
      activityLimit: 3,
    });
    console.error("  ✓ Connected to Convex successfully");
    console.error(`  Users: ${dashboard.totalUsers} total, ${dashboard.activeUsers} active`);
    console.error(`  User counts: ${JSON.stringify(dashboard.userCounts)}`);
    console.error(`  Cohorts: ${dashboard.cohortOverview.length}`);
    console.error(
      `  Financial: ${dashboard.financialSummary.totalDisbursed} total disbursed`,
    );
    console.error(
      `  Open safeguarding actions: ${dashboard.openSafeguardingCount}`,
    );
  } catch (error) {
    console.error(`  ✗ Failed to connect: ${error}`);
    process.exit(1);
  }

  console.error("\nSelf-check passed ✓");
}

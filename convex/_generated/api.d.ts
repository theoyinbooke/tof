/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as assessments_assignments from "../assessments/assignments.js";
import type * as assessments_responses from "../assessments/responses.js";
import type * as assessments_results from "../assessments/results.js";
import type * as assessments_scoring from "../assessments/scoring.js";
import type * as assessments_seed from "../assessments/seed.js";
import type * as assessments_templates from "../assessments/templates.js";
import type * as attendance from "../attendance.js";
import type * as auditLogs from "../auditLogs.js";
import type * as authHelpers from "../authHelpers.js";
import type * as beneficiaries from "../beneficiaries.js";
import type * as cohorts from "../cohorts.js";
import type * as crons from "../crons.js";
import type * as disbursements from "../disbursements.js";
import type * as documents from "../documents.js";
import type * as education from "../education.js";
import type * as email from "../email.js";
import type * as emailHelpers from "../emailHelpers.js";
import type * as emails_layout from "../emails/layout.js";
import type * as emails_templates from "../emails/templates.js";
import type * as exports from "../exports.js";
import type * as library from "../library.js";
import type * as libraryCategories from "../libraryCategories.js";
import type * as materials from "../materials.js";
import type * as mcp from "../mcp.js";
import type * as mentorAssignments from "../mentorAssignments.js";
import type * as mentorNotes from "../mentorNotes.js";
import type * as notifications from "../notifications.js";
import type * as safeguarding from "../safeguarding.js";
import type * as sessions from "../sessions.js";
import type * as sessions_seed from "../sessions/seed.js";
import type * as support from "../support.js";
import type * as users from "../users.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  "assessments/assignments": typeof assessments_assignments;
  "assessments/responses": typeof assessments_responses;
  "assessments/results": typeof assessments_results;
  "assessments/scoring": typeof assessments_scoring;
  "assessments/seed": typeof assessments_seed;
  "assessments/templates": typeof assessments_templates;
  attendance: typeof attendance;
  auditLogs: typeof auditLogs;
  authHelpers: typeof authHelpers;
  beneficiaries: typeof beneficiaries;
  cohorts: typeof cohorts;
  crons: typeof crons;
  disbursements: typeof disbursements;
  documents: typeof documents;
  education: typeof education;
  email: typeof email;
  emailHelpers: typeof emailHelpers;
  "emails/layout": typeof emails_layout;
  "emails/templates": typeof emails_templates;
  exports: typeof exports;
  library: typeof library;
  libraryCategories: typeof libraryCategories;
  materials: typeof materials;
  mcp: typeof mcp;
  mentorAssignments: typeof mentorAssignments;
  mentorNotes: typeof mentorNotes;
  notifications: typeof notifications;
  safeguarding: typeof safeguarding;
  sessions: typeof sessions;
  "sessions/seed": typeof sessions_seed;
  support: typeof support;
  users: typeof users;
  validators: typeof validators;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

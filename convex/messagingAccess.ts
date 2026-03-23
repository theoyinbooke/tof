import { QueryCtx, MutationCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Returns IDs of users the current user is allowed to message.
 *
 * Admin: all active users
 * Mentor: assigned beneficiaries + all admins
 * Facilitator: enrolled users in their sessions + all admins
 * Beneficiary: assigned mentor + active cohort peers + all admins
 */
export async function getAccessibleUserIds(
  ctx: QueryCtx | MutationCtx,
  currentUser: Doc<"users">,
): Promise<Id<"users">[]> {
  const ids = new Set<string>();

  if (currentUser.role === "admin") {
    const users = await ctx.db
      .query("users")
      .withIndex("by_role_and_isActive")
      .take(500);
    for (const u of users) {
      if (u.isActive && u._id !== currentUser._id) {
        ids.add(u._id);
      }
    }
  } else if (currentUser.role === "mentor") {
    // Assigned beneficiaries
    const assignments = await ctx.db
      .query("mentorAssignments")
      .withIndex("by_mentorId_and_isActive", (q) =>
        q.eq("mentorId", currentUser._id).eq("isActive", true),
      )
      .take(100);
    for (const a of assignments) {
      ids.add(a.beneficiaryUserId);
    }
    // All admins
    const admins = await ctx.db
      .query("users")
      .withIndex("by_role_and_isActive", (q) =>
        q.eq("role", "admin").eq("isActive", true),
      )
      .take(50);
    for (const a of admins) {
      ids.add(a._id);
    }
  } else if (currentUser.role === "facilitator") {
    // Users enrolled in sessions this facilitator runs
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_facilitatorId", (q) =>
        q.eq("facilitatorId", currentUser._id),
      )
      .take(100);
    for (const session of sessions) {
      const enrollments = await ctx.db
        .query("sessionEnrollments")
        .withIndex("by_sessionId_and_status", (q) =>
          q.eq("sessionId", session._id).eq("status", "enrolled"),
        )
        .take(200);
      for (const e of enrollments) {
        ids.add(e.userId);
      }
    }
    // All admins
    const admins = await ctx.db
      .query("users")
      .withIndex("by_role_and_isActive", (q) =>
        q.eq("role", "admin").eq("isActive", true),
      )
      .take(50);
    for (const a of admins) {
      ids.add(a._id);
    }
  } else if (currentUser.role === "beneficiary") {
    // Assigned mentor
    const assignments = await ctx.db
      .query("mentorAssignments")
      .withIndex("by_beneficiaryUserId_and_isActive", (q) =>
        q.eq("beneficiaryUserId", currentUser._id).eq("isActive", true),
      )
      .take(10);
    for (const a of assignments) {
      ids.add(a.mentorId);
    }
    // Cohort peers (active members in same active cohort)
    const myMemberships = await ctx.db
      .query("cohortMemberships")
      .withIndex("by_userId_and_status", (q) =>
        q.eq("userId", currentUser._id).eq("status", "active"),
      )
      .take(10);
    for (const membership of myMemberships) {
      const peers = await ctx.db
        .query("cohortMemberships")
        .withIndex("by_cohortId_and_status", (q) =>
          q.eq("cohortId", membership.cohortId).eq("status", "active"),
        )
        .take(200);
      for (const p of peers) {
        if (p.userId !== currentUser._id) {
          ids.add(p.userId);
        }
      }
    }
    // All admins
    const admins = await ctx.db
      .query("users")
      .withIndex("by_role_and_isActive", (q) =>
        q.eq("role", "admin").eq("isActive", true),
      )
      .take(50);
    for (const a of admins) {
      ids.add(a._id);
    }
  }

  // Remove self just in case
  ids.delete(currentUser._id);

  return Array.from(ids) as Id<"users">[];
}

/**
 * Checks whether the current user is allowed to message the target user.
 */
export async function canMessageUser(
  ctx: QueryCtx | MutationCtx,
  currentUser: Doc<"users">,
  targetUserId: Id<"users">,
): Promise<boolean> {
  if (currentUser._id === targetUserId) return false;
  const accessible = await getAccessibleUserIds(ctx, currentUser);
  return accessible.includes(targetUserId);
}

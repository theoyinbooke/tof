import { QueryCtx, MutationCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export async function requireIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity;
}

export async function requireUser(ctx: QueryCtx | MutationCtx): Promise<Doc<"users">> {
  const identity = await requireIdentity(ctx);

  const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();

  if (!user) {
    throw new Error("User not found. Please sign in again.");
  }

  if (!user.isActive) {
    throw new Error("Account is deactivated.");
  }

  return user;
}

export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  ...roles: Doc<"users">["role"][]
): Promise<Doc<"users">> {
  const user = await requireUser(ctx);

  if (!roles.includes(user.role)) {
    throw new Error(
      `Unauthorized. Required role: ${roles.join(" or ")}. Your role: ${user.role}.`,
    );
  }

  return user;
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx): Promise<Doc<"users">> {
  return requireRole(ctx, "admin");
}

export async function requireAdminOrFacilitator(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users">> {
  return requireRole(ctx, "admin", "facilitator");
}

export async function requireAdminOrMentor(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users">> {
  return requireRole(ctx, "admin", "mentor");
}

/**
 * Verify that the current user owns a beneficiary-scoped record.
 * Admins bypass ownership checks.
 */
export async function requireOwnerOrAdmin(
  ctx: QueryCtx | MutationCtx,
  ownerUserId: Id<"users">,
): Promise<Doc<"users">> {
  const user = await requireUser(ctx);

  if (user.role === "admin") {
    return user;
  }

  if (user._id !== ownerUserId) {
    throw new Error("You can only access your own records.");
  }

  return user;
}

/**
 * Check if a facilitator is assigned to a specific session.
 * Returns the user if they are the assigned facilitator or an admin.
 * Requires sessionEnrollments table to exist — will be used once Phase 4 is built.
 */
export async function requireFacilitatorForSession(
  ctx: QueryCtx | MutationCtx,
  sessionId: Id<"sessions">,
): Promise<Doc<"users">> {
  const user = await requireUser(ctx);

  if (user.role === "admin") {
    return user;
  }

  if (user.role !== "facilitator") {
    throw new Error("Only facilitators and admins can access session data.");
  }

  const session = await ctx.db.get(sessionId);
  if (!session) {
    throw new Error("Session not found.");
  }

  if ("facilitatorId" in session && session.facilitatorId !== user._id) {
    throw new Error("You are not assigned to this session.");
  }

  return user;
}

/**
 * Check if a mentor is assigned to a specific beneficiary.
 * Returns the user if they are the assigned mentor or an admin.
 * Requires mentorAssignments table to exist — will be used once Phase 2 is built.
 */
export async function requireMentorForBeneficiary(
  ctx: QueryCtx | MutationCtx,
  beneficiaryUserId: Id<"users">,
): Promise<Doc<"users">> {
  const user = await requireUser(ctx);

  if (user.role === "admin") {
    return user;
  }

  if (user.role !== "mentor") {
    throw new Error("Only mentors and admins can access mentee data.");
  }

  const assignment = await ctx.db
    .query("mentorAssignments")
    .withIndex("by_mentorId_and_isActive", (q) =>
      q.eq("mentorId", user._id).eq("isActive", true),
    )
    .take(100);

  const isAssigned = assignment.some(
    (a) => a.beneficiaryUserId === beneficiaryUserId,
  );

  if (!isAssigned) {
    throw new Error("You are not assigned as mentor to this beneficiary.");
  }

  return user;
}

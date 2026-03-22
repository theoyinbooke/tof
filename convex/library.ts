import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireUser } from "./authHelpers";
import { notifyWithEmail } from "./emailHelpers";

// ─── Admin Queries ───

/**
 * List all materials with enriched data for admin management.
 */
export const adminList = query({
  args: {
    categoryId: v.optional(v.id("libraryCategories")),
    visibility: v.optional(
      v.union(v.literal("public"), v.literal("restricted")),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    let materials;
    if (args.categoryId) {
      materials = await ctx.db
        .query("materials")
        .withIndex("by_categoryId", (q) =>
          q.eq("categoryId", args.categoryId),
        )
        .take(500);
    } else if (args.visibility) {
      materials = await ctx.db
        .query("materials")
        .withIndex("by_visibility", (q) =>
          q.eq("visibility", args.visibility),
        )
        .take(500);
    } else {
      materials = await ctx.db.query("materials").take(500);
    }

    // Enrich with category name and access count
    const enriched = await Promise.all(
      materials.map(async (m) => {
        const category = m.categoryId
          ? await ctx.db.get(m.categoryId)
          : null;
        const accessGrants = await ctx.db
          .query("resourceAccess")
          .withIndex("by_materialId", (q) => q.eq("materialId", m._id))
          .take(200);
        const creator = await ctx.db.get(m.createdBy);
        return {
          ...m,
          categoryName: category?.name ?? null,
          accessGrantCount: accessGrants.length,
          creatorName: creator?.name ?? "Unknown",
        };
      }),
    );

    return enriched;
  },
});

/**
 * Get all access grants for a specific material.
 */
export const getAccessList = query({
  args: { materialId: v.id("materials") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const grants = await ctx.db
      .query("resourceAccess")
      .withIndex("by_materialId", (q) => q.eq("materialId", args.materialId))
      .take(200);

    // Enrich with names
    const enriched = await Promise.all(
      grants.map(async (g) => {
        let targetName = "Unknown";
        if (g.targetType === "cohort" && g.cohortId) {
          const cohort = await ctx.db.get(g.cohortId);
          targetName = cohort?.name ?? "Deleted cohort";
        } else if (g.targetType === "user" && g.userId) {
          const user = await ctx.db.get(g.userId);
          targetName = user?.name ?? "Deleted user";
        }
        const grantedByUser = await ctx.db.get(g.grantedBy);
        return {
          ...g,
          targetName,
          grantedByName: grantedByUser?.name ?? "Unknown",
        };
      }),
    );

    return enriched;
  },
});

// ─── User Queries ───

/**
 * List materials visible to the current user.
 * Shows: all public materials + restricted materials the user has direct or cohort-based access to.
 */
export const userList = query({
  args: {
    categoryId: v.optional(v.id("libraryCategories")),
    pillar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    // Admins see everything
    if (user.role === "admin") {
      let all;
      if (args.categoryId) {
        all = await ctx.db
          .query("materials")
          .withIndex("by_categoryId", (q) =>
            q.eq("categoryId", args.categoryId),
          )
          .take(500);
      } else if (args.pillar) {
        all = await ctx.db
          .query("materials")
          .withIndex("by_pillar", (q) => q.eq("pillar", args.pillar))
          .take(500);
      } else {
        all = await ctx.db.query("materials").take(500);
      }
      return await enrichMaterialsForUser(ctx, all);
    }

    // Get all materials (we'll filter access in memory)
    let allMaterials;
    if (args.categoryId) {
      allMaterials = await ctx.db
        .query("materials")
        .withIndex("by_categoryId", (q) =>
          q.eq("categoryId", args.categoryId),
        )
        .take(500);
    } else if (args.pillar) {
      allMaterials = await ctx.db
        .query("materials")
        .withIndex("by_pillar", (q) => q.eq("pillar", args.pillar))
        .take(500);
    } else {
      allMaterials = await ctx.db.query("materials").take(500);
    }

    // Get user's direct access grants
    const directGrants = await ctx.db
      .query("resourceAccess")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(500);
    const directAccessIds = new Set(directGrants.map((g) => g.materialId));

    // Get user's cohort memberships
    const memberships = await ctx.db
      .query("cohortMemberships")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(50);
    const activeCohortIds = memberships
      .filter((m) => m.status === "active" || m.status === "completed" || m.status === "alumni")
      .map((m) => m.cohortId);

    // Get cohort-based access grants
    const cohortAccessIds = new Set<string>();
    for (const cohortId of activeCohortIds) {
      const cohortGrants = await ctx.db
        .query("resourceAccess")
        .withIndex("by_cohortId", (q) => q.eq("cohortId", cohortId))
        .take(200);
      for (const g of cohortGrants) {
        cohortAccessIds.add(g.materialId);
      }
    }

    // Filter: public materials OR materials user has access to
    const visible = allMaterials.filter((m) => {
      // Public or no visibility set (treat as public for backward compat)
      if (!m.visibility || m.visibility === "public") return true;
      // Restricted: check access grants
      return directAccessIds.has(m._id) || cohortAccessIds.has(m._id as string);
    });

    return await enrichMaterialsForUser(ctx, visible);
  },
});

async function enrichMaterialsForUser(
  ctx: { db: { get: (id: any) => Promise<any> } },
  materials: any[],
) {
  return await Promise.all(
    materials.map(async (m) => {
      const category = m.categoryId ? await ctx.db.get(m.categoryId) : null;
      return {
        ...m,
        categoryName: category?.name ?? null,
      };
    }),
  );
}

/**
 * Get a download URL for a material's file.
 */
export const getFileUrl = query({
  args: { materialId: v.id("materials") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const material = await ctx.db.get(args.materialId);
    if (!material) throw new Error("Material not found.");

    // Check access for restricted materials (non-admin)
    if (
      user.role !== "admin" &&
      material.visibility === "restricted"
    ) {
      const directGrant = await ctx.db
        .query("resourceAccess")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .take(500);
      const hasDirectAccess = directGrant.some(
        (g) => g.materialId === args.materialId,
      );

      if (!hasDirectAccess) {
        // Check cohort access
        const memberships = await ctx.db
          .query("cohortMemberships")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .take(50);
        const cohortIds = memberships
          .filter((m) => m.status === "active" || m.status === "completed" || m.status === "alumni")
          .map((m) => m.cohortId);

        let hasCohortAccess = false;
        for (const cohortId of cohortIds) {
          const grants = await ctx.db
            .query("resourceAccess")
            .withIndex("by_cohortId", (q) => q.eq("cohortId", cohortId))
            .take(200);
          if (grants.some((g) => g.materialId === args.materialId)) {
            hasCohortAccess = true;
            break;
          }
        }

        if (!hasCohortAccess) {
          throw new Error("You do not have access to this resource.");
        }
      }
    }

    if (!material.storageId) return null;
    return await ctx.storage.getUrl(material.storageId);
  },
});

// ─── Admin Mutations ───

/**
 * Generate an upload URL for a library resource file.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Grant access to a material for a cohort or user.
 */
export const grantAccess = mutation({
  args: {
    materialId: v.id("materials"),
    targetType: v.union(v.literal("cohort"), v.literal("user")),
    cohortId: v.optional(v.id("cohorts")),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const material = await ctx.db.get(args.materialId);
    if (!material) throw new Error("Material not found.");

    if (args.targetType === "cohort") {
      if (!args.cohortId) throw new Error("cohortId is required for cohort access.");
      const cohort = await ctx.db.get(args.cohortId);
      if (!cohort) throw new Error("Cohort not found.");

      // Check for duplicate
      const existing = await ctx.db
        .query("resourceAccess")
        .withIndex("by_materialId_and_targetType", (q) =>
          q.eq("materialId", args.materialId).eq("targetType", "cohort"),
        )
        .take(200);
      if (existing.some((e) => e.cohortId === args.cohortId)) {
        throw new Error("Access already granted to this cohort.");
      }

      await ctx.db.insert("resourceAccess", {
        materialId: args.materialId,
        targetType: "cohort",
        cohortId: args.cohortId,
        grantedBy: admin._id,
        grantedAt: Date.now(),
      });

      // Notify all active cohort members
      const members = await ctx.db
        .query("cohortMemberships")
        .withIndex("by_cohortId_and_status", (q) =>
          q.eq("cohortId", args.cohortId!).eq("status", "active"),
        )
        .take(200);

      for (const member of members) {
        await notifyWithEmail(ctx, {
          userId: member.userId,
          type: "resource_assigned",
          title: `New resource available: ${material.title}`,
          body: `A new resource "${material.title}" has been shared with your cohort "${cohort.name}".`,
          eventKey: `resource_assigned:${args.materialId}:cohort:${args.cohortId}:${member.userId}`,
          linkUrl: "/library",
          emailType: "resource-assigned",
          templateData: {
            resourceTitle: material.title,
            resourceType: material.type,
            assignedTo: cohort.name,
          },
        });
      }
    } else {
      if (!args.userId) throw new Error("userId is required for user access.");
      const targetUser = await ctx.db.get(args.userId);
      if (!targetUser) throw new Error("User not found.");

      // Check for duplicate
      const existing = await ctx.db
        .query("resourceAccess")
        .withIndex("by_materialId_and_targetType", (q) =>
          q.eq("materialId", args.materialId).eq("targetType", "user"),
        )
        .take(200);
      if (existing.some((e) => e.userId === args.userId)) {
        throw new Error("Access already granted to this user.");
      }

      await ctx.db.insert("resourceAccess", {
        materialId: args.materialId,
        targetType: "user",
        userId: args.userId,
        grantedBy: admin._id,
        grantedAt: Date.now(),
      });

      // Notify the user
      await notifyWithEmail(ctx, {
        userId: args.userId,
        type: "resource_assigned",
        title: `New resource available: ${material.title}`,
        body: `A resource "${material.title}" has been shared with you.`,
        eventKey: `resource_assigned:${args.materialId}:user:${args.userId}`,
        linkUrl: "/library",
        emailType: "resource-assigned",
        templateData: {
          resourceTitle: material.title,
          resourceType: material.type,
          assignedTo: targetUser.name,
        },
      });
    }
  },
});

/**
 * Revoke access from a cohort or user.
 */
export const revokeAccess = mutation({
  args: { accessId: v.id("resourceAccess") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const grant = await ctx.db.get(args.accessId);
    if (!grant) throw new Error("Access grant not found.");
    await ctx.db.delete(args.accessId);
  },
});

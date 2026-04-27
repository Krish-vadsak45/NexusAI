import Project from "@/models/Project.model";
import redis from "@/lib/redisClient";
import logger from "@/lib/logger";
import type { ProjectAccessRecord, ProjectMember } from "@/lib/shared-types";

export type Role = "owner" | "editor" | "viewer";

type MembershipCheckResult = {
  allowed: boolean;
  member?: ProjectMember;
  project?: ProjectAccessRecord | null;
};

// 1. Define Cache Settings
const ACL_CACHE_TTL = 300; // 5 minutes

// In-Memory map to store pending database promises (Cache Stampede Protection)
const inFlightAclRequests = new Map<string, Promise<MembershipCheckResult>>();

export function rolePriority(r: string | undefined): number {
  switch (r) {
    case "owner":
      return 3;
    case "editor":
      return 2;
    case "viewer":
      return 1;
    default:
      return 0;
  }
}

/**
 * Check if a user (session.user.id) has at least one of allowedRoles on the project.
 * Returns the project document and the member entry if allowed, otherwise null.
 */
export async function checkProjectMembership(
  userId: string,
  projectId: string,
  allowedRoles: Role[] = ["viewer"],
) {
  if (!userId || !projectId) return { allowed: false };

  // 2. Try Redis Cache First
  const cacheKey = `acl:user:${userId}:proj:${projectId}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      const { project, member } = JSON.parse(cached);
      const memberPriority = rolePriority(member?.role);
      const minAllowedPriority = Math.min(
        ...allowedRoles.map((role) => rolePriority(role)),
      );

      if (memberPriority >= minAllowedPriority) {
        return { allowed: true, project, member };
      }
    }
  } catch (e) {
    logger.warn({ err: e }, "ACL Redis fetch failed");
  }

  // --- CACHE STAMPEDE PREVENTION (Request Coalescing) ---
  // If 1000 requests hit simultaneously for the same user/project while cache is empty,
  // only the FIRST request queries the DB. The other 999 will wait on this stored Promise.
  if (inFlightAclRequests.has(cacheKey)) {
    const pendingRequest = inFlightAclRequests.get(cacheKey);
    if (!pendingRequest) {
      return { allowed: false };
    }
    const coalescedResult = await pendingRequest;

    // We must re-evaluate allowedRoles for each coalesced request, as parallel callers
    // might have asked for different permission levels on the same project
    const memberPriority = rolePriority(coalescedResult.member?.role);
    const minAllowedPriority = Math.min(
      ...allowedRoles.map((role) => rolePriority(role)),
    );

    if (memberPriority >= minAllowedPriority) {
      return {
        allowed: true,
        member: coalescedResult.member,
        project: coalescedResult.project,
      };
    }
    return { allowed: false };
  }

  const fetchPromise: Promise<MembershipCheckResult> = (async () => {
    try {
      const project = await Project.findById(projectId).lean();
      if (!project) return { allowed: false };

      // Determine role
      const projectData = project as ProjectAccessRecord;
      let member = projectData.members?.find(
        (projectMember: ProjectMember) => projectMember.userId === userId,
      );
      let role = member?.role;

      if (projectData.userId === userId) {
        role = "owner";
        member = { userId, role: "owner" };
      }

      if (!role) return { allowed: false };

      const memberObj = member || { userId, role };
      const memberPriority = rolePriority(role);
      const minAllowedPriority = Math.min(
        ...allowedRoles.map((r) => rolePriority(r)),
      );

      const result = {
        allowed: memberPriority >= minAllowedPriority,
        project: projectData,
        member: memberObj,
      };

      // 3. Store result in Cache for 5 minutes
      if (result.allowed) {
        try {
          await redis.set(
            cacheKey,
            JSON.stringify(result),
            "EX",
            ACL_CACHE_TTL,
          );
        } catch (e) {
          logger.warn({ err: e }, "ACL Redis set failed");
        }
      }

      return result;
    } finally {
      // Clean up the in-flight map when done so future missing cache hits do a fresh DB query
      inFlightAclRequests.delete(cacheKey);
    }
  })();

  // Store the promise in our map so other concurrent requests can wait for it
  inFlightAclRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

/**
 * Remove a user's cached ACL payload for a specific project.
 * Call this whenever a user's role on a project changes or they are removed.
 */
export async function invalidateAclCache(userId: string, projectId: string) {
  if (!userId || !projectId) return;

  const cacheKey = `acl:user:${userId}:proj:${projectId}`;
  try {
    await redis.del(cacheKey);
    logger.info({ userId, projectId }, "ACL cache invalidated");
  } catch (e) {
    logger.warn({ err: e }, "ACL Redis invalidation failed");
  }
}

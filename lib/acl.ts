import Project from "../models/Project.model";
import redis from "./redisClient";
import logger from "./logger";

export type Role = "owner" | "editor" | "viewer";

// 1. Define Cache Settings
const ACL_CACHE_TTL = 300; // 5 minutes

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

  const project = await Project.findById(projectId).lean();
  if (!project) return { allowed: false };

  // Determine role
  let member = (project as any).members?.find((m: any) => m.userId === userId);
  let role = member?.role;

  if ((project as any).userId === userId) {
    role = "owner";
    member = { userId, role: "owner" };
  }

  if (!role) return { allowed: false };

  const memberPriority = rolePriority(role);
  const minAllowedPriority = Math.min(
    ...allowedRoles.map((r) => rolePriority(r)),
  );

  const result = {
    allowed: memberPriority >= minAllowedPriority,
    project,
    member: member || { userId, role },
  };

  // 3. Store result in Cache for 5 minutes
  if (result.allowed) {
    try {
      await redis.set(cacheKey, JSON.stringify(result), "EX", ACL_CACHE_TTL);
    } catch (e) {
      logger.warn({ err: e }, "ACL Redis set failed");
    }
  }

  return result;
}

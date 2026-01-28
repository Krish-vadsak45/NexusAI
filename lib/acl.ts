import Project from "../models/Project.model";

export type Role = "owner" | "editor" | "viewer";

export function rolePriority(r: Role | string | undefined) {
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
  if (!userId) return { allowed: false };
  const project = await Project.findById(projectId);
  if (!project) return { allowed: false };
  console.log(
    "Checking membership for user",
    userId,
    "on project",
    projectId,
    "allowedRoles",
    allowedRoles,
    "project members:",
    project,
  );
  // owner by userId (legacy 'userId' field) => owner
  if ((project as any).userId === userId) {
    return { allowed: true, project, member: { userId, role: "owner" } };
  }

  const member = (project as any).members?.find(
    (m: any) => m.userId === userId,
  );
  console.log("Found member entry:", member);
  if (!member) return { allowed: false };

  const memberPriority = rolePriority(member.role);
  const minAllowedPriority = Math.min(...allowedRoles.map(rolePriority));
  if (memberPriority >= minAllowedPriority) {
    return { allowed: true, project, member };
  }

  return { allowed: false };
}

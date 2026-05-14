import type { ProjectAccessRecord, ProjectMember, ProjectRole } from "@/lib/shared-types";

export type ProjectPermission =
  | "project:view"
  | "project:update"
  | "project:delete"
  | "project:invite:create"
  | "project:invite:cancel"
  | "project:member:role:update"
  | "project:member:remove"
  | "project:asset:create";

const ROLE_PERMISSIONS: Record<ProjectRole, ProjectPermission[]> = {
  owner: [
    "project:view",
    "project:update",
    "project:delete",
    "project:invite:create",
    "project:invite:cancel",
    "project:member:role:update",
    "project:member:remove",
    "project:asset:create",
  ],
  editor: [
    "project:view",
    "project:update",
    "project:invite:create",
    "project:invite:cancel",
    "project:asset:create",
  ],
  viewer: ["project:view"],
};

export function getProjectPermissions(member?: ProjectMember | null) {
  const base = member?.role ? ROLE_PERMISSIONS[member.role] : [];
  const overrides = member?.permissionsOverrides;

  if (!overrides || typeof overrides !== "object") {
    return new Set<ProjectPermission>(base);
  }

  const allowed = new Set<ProjectPermission>(base);

  Object.entries(overrides).forEach(([permission, enabled]) => {
    if (enabled === true) {
      allowed.add(permission as ProjectPermission);
    }
    if (enabled === false) {
      allowed.delete(permission as ProjectPermission);
    }
  });

  return allowed;
}

export function hasProjectPermission(
  project: ProjectAccessRecord | null | undefined,
  member: ProjectMember | null | undefined,
  permission: ProjectPermission,
) {
  if (!project || !member) return false;

  if (project.userId && String(project.userId) === String(member.userId)) {
    return true;
  }

  return getProjectPermissions(member).has(permission);
}

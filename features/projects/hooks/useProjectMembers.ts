"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { apiDelete, apiGet, apiPatch } from "@/lib/api/client";
import { projectMembersResponseSchema } from "@/lib/api/contracts";
import { getErrorMessage } from "@/lib/error-utils";
import type { ProjectMember } from "@/lib/shared-types";
import { z } from "zod";

const successSchema = z.object({ success: z.boolean() });

export function useProjectMembers(projectId: string, active: boolean) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersPage, setMembersPage] = useState(1);
  const [membersPagination, setMembersPagination] = useState({
    total: 0,
    totalPages: 0,
    limit: 10,
  });

  const loadMembers = useCallback(async () => {
    if (!projectId) return;
    setMembersLoading(true);
    try {
      const response = await apiGet(
        `/api/projects/${projectId}/members?page=${membersPage}&limit=10`,
        projectMembersResponseSchema,
      );
      setMembers(response.members || []);
      setMembersPagination({
        total: response.total,
        totalPages: response.totalPages,
        limit: response.limit,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load members"));
    } finally {
      setMembersLoading(false);
    }
  }, [membersPage, projectId]);

  useEffect(() => {
    if (active) {
      void loadMembers();
    }
  }, [active, loadMembers]);

  const updateRole = useCallback(
    async (memberUserId: string, newRole: string) => {
      try {
        await apiPatch(
          `/api/projects/${projectId}/members/${memberUserId}`,
          { role: newRole },
          successSchema,
        );
        toast.success("Role updated");
        await loadMembers();
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to update role"));
      }
    },
    [loadMembers, projectId],
  );

  const removeMember = useCallback(
    async (memberUserId: string) => {
      if (!confirm("Are you sure you want to remove this member?")) return;

      try {
        await apiDelete(
          `/api/projects/${projectId}/members/${memberUserId}`,
          successSchema,
        );
        toast.success("Member removed");
        setMembers((current) => current.filter((m) => m.userId !== memberUserId));
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to remove member"));
      }
    },
    [projectId],
  );

  return {
    members,
    setMembers,
    membersLoading,
    membersPage,
    setMembersPage,
    membersPagination,
    loadMembers,
    updateRole,
    removeMember,
  };
}

"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { apiGet } from "@/lib/api/client";
import {
  invitesListResponseSchema,
  notificationsResponseSchema,
} from "@/lib/api/contracts";
import { getErrorMessage } from "@/lib/error-utils";
import type { InviteRecord, NotificationRecord } from "@/lib/shared-types";

export function useProjectInbox(projectId: string) {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [projectInvites, setProjectInvites] = useState<InviteRecord[]>([]);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [inboxLoading, setInboxLoading] = useState(false);

  const loadInbox = useCallback(async () => {
    setInboxOpen(true);
    setInboxLoading(true);
    try {
      const [notificationsResponse, invitesResponse] = await Promise.all([
        apiGet(
          `/api/notifications?projectId=${projectId}&showRead=false`,
          notificationsResponseSchema,
        ),
        apiGet(
          `/api/projects/${projectId}/invites`,
          invitesListResponseSchema,
        ).catch(() => ({ invites: [] })),
      ]);
      setNotifications(notificationsResponse.notifications || []);
      setProjectInvites(invitesResponse.invites || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load inbox"));
    } finally {
      setInboxLoading(false);
    }
  }, [projectId]);

  return {
    notifications,
    setNotifications,
    projectInvites,
    setProjectInvites,
    inboxOpen,
    setInboxOpen,
    inboxLoading,
    loadInbox,
  };
}

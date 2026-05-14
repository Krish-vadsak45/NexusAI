"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { apiGet } from "@/lib/api/client";
import {
  historyListResponseSchema,
  projectSummarySchema,
} from "@/lib/api/contracts";
import { getErrorMessage } from "@/lib/error-utils";
import { getHistoryItemsFromResponse } from "@/lib/history-utils";
import type { HistoryItem } from "@/lib/shared-types";

export type ProjectDetails = {
  _id: string;
  name: string;
  description?: string;
  createdBy?: string;
  createdAt?: string;
  userId?: string;
};

export function useProjectDetails(projectId: string) {
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    const fetchData = async () => {
      try {
        const [projectRes, historyRes, profileRes] = await Promise.all([
          apiGet(`/api/projects/${projectId}`, projectSummarySchema.passthrough()),
          apiGet(
            `/api/history?projectId=${projectId}`,
            historyListResponseSchema,
          ).catch(async () => {
            const response = await axios.get(`/api/history?projectId=${projectId}`);
            return {
              ...response.data,
              items: getHistoryItemsFromResponse(response.data),
            };
          }),
          axios.get(`/api/profile`).catch(() => null),
        ]);

        setProject(projectRes);
        setHistoryItems(historyRes.items || []);

        if (profileRes?.data?.user?.id) {
          setCurrentUserId(profileRes.data.user.id);
          const projUserId = projectRes.userId || projectRes.createdBy || null;
          setIsOwner(String(projUserId) === String(profileRes.data.user.id));
        }
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to load project details"));
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [projectId]);

  const uniqueTools = useMemo(
    () => Array.from(new Set(historyItems.map((item) => item.tool))),
    [historyItems],
  );

  return {
    project,
    historyItems,
    setHistoryItems,
    loading,
    currentUserId,
    isOwner,
    uniqueTools,
  };
}

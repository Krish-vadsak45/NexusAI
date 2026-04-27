import type { ReactNode } from "react";

export type ProjectRole = "owner" | "editor" | "viewer";
export type UnknownRecord = Record<string, unknown>;

export interface ProjectMember {
  email?: string | null;
  userId: string;
  role: ProjectRole;
  invitedBy?: string;
  inviteStatus?: "accepted" | "pending" | "declined";
  joinedAt?: Date | string;
  permissionsOverrides?: UnknownRecord | null;
  userName?: string;
  userEmail?: string | null;
  invitedByEmail?: string | null;
}

export interface ProjectAccessRecord {
  userId?: string;
  name?: string;
  members?: ProjectMember[];
}

export interface HistoryItem {
  _id: string;
  tool: string;
  title: string;
  createdAt: string;
  input: UnknownRecord;
  output: unknown;
}

export interface TitleSuggestion {
  title: string;
}

export interface InviteRecord {
  _id: string;
  email: string;
  role: ProjectRole;
  status: string;
  createdAt: string;
}

export interface NotificationRecord {
  _id: string;
  type: string;
  createdAt: string;
  data?: UnknownRecord & {
    inviteId?: string;
    invitedByName?: string;
    rejectedByName?: string;
    projectName?: string;
    projectId?: string;
    role?: string;
  };
}

export interface FloatingNodeProps {
  position: string;
  icon: ReactNode;
  label: string;
  duration?: number;
}

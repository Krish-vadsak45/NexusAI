import { z } from "zod";

export const projectRoleSchema = z.enum(["owner", "editor", "viewer"]);

export const historyItemSchema = z.object({
  _id: z.string(),
  tool: z.string(),
  title: z.string(),
  createdAt: z.string(),
  input: z.record(z.string(), z.unknown()),
  output: z.unknown(),
});

export const historyCreateRequestSchema = z.object({
  tool: z.string().min(1),
  title: z.string().min(1),
  input: z.record(z.string(), z.unknown()),
  output: z.unknown(),
  projectId: z.string().optional().nullable(),
});

export const historyListQuerySchema = z.object({
  projectId: z.string().optional().nullable(),
  cursor: z.string().optional().nullable(),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  tool: z.string().optional().nullable(),
  search: z.string().optional().nullable(),
});

export const historyListResponseSchema = z.object({
  items: z.array(historyItemSchema),
  nextCursor: z.union([z.string(), z.null()]),
  totalCount: z.number(),
});

export const projectSummarySchema = z.object({
  _id: z.string(),
  userId: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const projectCreateRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const projectListResponseSchema = z.object({
  projects: z.array(projectSummarySchema),
  nextCursor: z.union([z.string(), z.null()]),
  total: z.number(),
});

export const projectMemberSchema = z.object({
  userId: z.string(),
  role: projectRoleSchema,
  inviteStatus: z.enum(["accepted", "pending", "declined"]).optional(),
  invitedBy: z.string().optional(),
  joinedAt: z.union([z.string(), z.date()]).optional(),
  permissionsOverrides: z.record(z.string(), z.unknown()).nullable().optional(),
  userName: z.string().optional(),
  userEmail: z.string().nullable().optional(),
  invitedByEmail: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
});

export const projectMembersResponseSchema = z.object({
  members: z.array(projectMemberSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const inviteCreateRequestSchema = z.object({
  email: z.string().email(),
  role: projectRoleSchema.default("viewer"),
});

export const inviteRecordSchema = z.object({
  _id: z.string(),
  email: z.string(),
  role: projectRoleSchema,
  status: z.string(),
  createdAt: z.string(),
});

export const invitesListResponseSchema = z.object({
  invites: z.array(inviteRecordSchema),
});

export const inviteDeleteRequestSchema = z.object({
  inviteId: z.string().min(1),
});

export const inviteRespondRequestSchema = z.object({
  inviteId: z.string().min(1),
  action: z.enum(["accept", "reject"]),
});

export const notificationRecordSchema = z.object({
  _id: z.string(),
  type: z.string(),
  createdAt: z.string(),
  data: z
    .object({
      inviteId: z.string().optional(),
      invitedByName: z.string().optional(),
      rejectedByName: z.string().optional(),
      projectName: z.string().optional(),
      projectId: z.string().optional(),
      role: z.string().optional(),
    })
    .passthrough()
    .optional(),
});

export const notificationsResponseSchema = z.object({
  notifications: z.array(notificationRecordSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export const articleWriterRequestSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  keywords: z.string().optional(),
  tone: z.enum(["professional", "casual", "enthusiastic", "witty"]),
  length: z.enum(["short", "medium", "long"]),
  language: z.enum(["english", "spanish", "french", "german"]),
  projectId: z.string().optional(),
});

export const articleWriterContentSchema = z.object({
  article: z.string(),
  seo: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
  }),
  social: z.object({
    twitter: z.string(),
    linkedin: z.string(),
  }),
  summary: z.union([z.string(), z.array(z.string())]),
});

export const aiJobStatusSchema = z.enum([
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const aiJobResponseSchema = z.object({
  _id: z.string(),
  type: z.string(),
  status: aiJobStatusSchema,
  idempotencyKey: z.string(),
  attempts: z.number(),
  maxAttempts: z.number(),
  startedAt: z.string().nullable().optional(),
  completedAt: z.string().nullable().optional(),
  error: z.string().nullable().optional(),
  requestId: z.string().optional(),
  metrics: z
    .object({
      durationMs: z.number().optional(),
      estimatedTokens: z.number().optional(),
      promptTokens: z.number().optional(),
      completionTokens: z.number().optional(),
    })
    .partial()
    .optional(),
  result: articleWriterContentSchema.optional(),
});

export type HistoryCreateRequest = z.infer<typeof historyCreateRequestSchema>;
export type HistoryListResponse = z.infer<typeof historyListResponseSchema>;
export type ProjectListResponse = z.infer<typeof projectListResponseSchema>;
export type ProjectMembersResponse = z.infer<typeof projectMembersResponseSchema>;
export type InvitesListResponse = z.infer<typeof invitesListResponseSchema>;
export type NotificationsResponse = z.infer<typeof notificationsResponseSchema>;
export type ArticleWriterRequest = z.infer<typeof articleWriterRequestSchema>;
export type ArticleWriterContent = z.infer<typeof articleWriterContentSchema>;
export type AIJobResponse = z.infer<typeof aiJobResponseSchema>;

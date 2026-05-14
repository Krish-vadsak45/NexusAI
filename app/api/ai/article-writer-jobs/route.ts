import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import AIJob from "@/models/AIJob.model";
import {
  aiJobResponseSchema,
  articleWriterRequestSchema,
} from "@/lib/api/contracts";
import { createRequestContext } from "@/lib/observability";
import { processArticleWriterJob } from "@/lib/ai/jobs";
import { UnauthorizedError, withApiHandler } from "@/lib/errors";

type ArticleWriterJob = {
  _id: unknown;
  type: string;
  status: string;
  idempotencyKey: string;
  attempts: number;
  maxAttempts: number;
  startedAt?: Date | null;
  completedAt?: Date | null;
  error?: string | null;
  requestId?: string;
  metrics?: Record<string, unknown>;
  result?: unknown;
};

export const POST = withApiHandler(async (req: Request) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new UnauthorizedError();

  await connectToDatabase();
  const body = articleWriterRequestSchema.parse(await req.json());
  const requestContext = createRequestContext(req);
  const idempotencyKey =
    req.headers.get("idempotency-key") ||
    `${session.user.id}:${body.topic}:${body.tone}:${body.length}:${body.language}:${body.projectId || "no-project"}`;

  const existing = await AIJob.findOne({
    userId: session.user.id,
    type: "article_writer",
    idempotencyKey,
  }).lean<ArticleWriterJob | null>();

  if (existing) {
    return NextResponse.json(aiJobResponseSchema.parse(serializeJob(existing)));
  }

  const job = await AIJob.create({
    userId: session.user.id,
    type: "article_writer",
    status: "pending",
    idempotencyKey,
    payload: body,
    requestId: requestContext.requestId,
  });

  setTimeout(() => {
    void processArticleWriterJob(String(job._id));
  }, 0);

  return NextResponse.json(aiJobResponseSchema.parse(serializeJob(job)), {
    status: 202,
  });
});

function serializeJob(job: ArticleWriterJob) {
  return {
    _id: String(job._id),
    type: job.type,
    status: job.status,
    idempotencyKey: job.idempotencyKey,
    attempts: job.attempts,
    maxAttempts: job.maxAttempts,
    startedAt: job.startedAt ? new Date(job.startedAt).toISOString() : null,
    completedAt: job.completedAt
      ? new Date(job.completedAt).toISOString()
      : null,
    error: job.error ?? null,
    requestId: job.requestId,
    metrics: job.metrics,
    result: job.result,
  };
}

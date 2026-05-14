import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import AIJob from "@/models/AIJob.model";
import { aiJobResponseSchema } from "@/lib/api/contracts";
import { UnauthorizedError, withApiHandler } from "@/lib/errors";

type ArticleWriterJob = {
  _id: string;
  type: string;
  status: "pending" | "processing" | "completed" | "failed";
  idempotencyKey: string;
  attempts: number;
  maxAttempts: number;
  startedAt?: Date | string | null;
  completedAt?: Date | string | null;
  error?: string | null;
  requestId?: string | null;
  metrics?: Record<string, unknown>;
  result?: unknown;
};

export const GET = withApiHandler(
  async (
    _req: Request,
    context?: { params: Promise<{ id: string }> },
  ) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new UnauthorizedError();

    await connectToDatabase();
    if (!context?.params) {
      return NextResponse.json({ error: "Missing route params" }, { status: 400 });
    }
    const { id } = await context.params;
    const job = await AIJob.findOne({ _id: id, userId: session.user.id }).lean<ArticleWriterJob | null>();
    if (!job) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(
      aiJobResponseSchema.parse({
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
      }),
    );
  },
);

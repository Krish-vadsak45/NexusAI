import AIJob from "@/models/AIJob.model";
import History from "@/models/History.model";
import Audit from "@/models/Audit.model";
import logger from "@/lib/logger";
import { logBackgroundMetric } from "@/lib/observability";
import {
  checkAndIncrementUsage,
  recordUsageResult,
  revertFeatureUsage,
} from "@/middleware/usage";
import {
  articleWriterRequestSchema,
  type ArticleWriterRequest,
} from "@/lib/api/contracts";
import { generateArticleWriterContent } from "@/lib/ai/article-writer";

export async function processArticleWriterJob(jobId: string) {
  const job = await AIJob.findById(jobId);
  if (!job || job.status === "completed") return;

  const payload = articleWriterRequestSchema.parse(job.payload) as ArticleWriterRequest;
  const startedAt = Date.now();

  job.status = "processing";
  job.startedAt = new Date();
  job.attempts += 1;
  await job.save();

  const usageCheck = await checkAndIncrementUsage(job.userId, "article_writer");
  if (!usageCheck.allowed) {
    job.status = "failed";
    job.error = usageCheck.message || "Usage limit reached";
    job.completedAt = new Date();
    await job.save();
    return;
  }

  try {
    const { content, metrics } = await generateArticleWriterContent(payload);

    job.status = "completed";
    job.result = content;
    job.error = null;
    job.completedAt = new Date();
    job.metrics = {
      ...metrics,
      durationMs: Date.now() - startedAt,
    };
    await job.save();

    await History.create({
      userId: job.userId,
      projectId: payload.projectId || null,
      tool: "Article Writer",
      title: payload.topic,
      input: payload,
      output: content,
    });

    await recordUsageResult(
      job.userId,
      "article_writer",
      metrics.estimatedTokens,
      "success",
    );

    await Audit.create({
      action: "ai.job.completed",
      actor: job.userId,
      targetType: "ai_job",
      targetId: job._id,
      data: {
        type: job.type,
        durationMs: job.metrics?.durationMs,
        estimatedTokens: metrics.estimatedTokens,
      },
    });

    logBackgroundMetric({
      requestId: job.requestId,
      jobId: String(job._id),
      userId: job.userId,
      type: job.type,
      durationMs: job.metrics?.durationMs,
      estimatedTokens: metrics.estimatedTokens,
    });
  } catch (error) {
    logger.error({ err: error, jobId }, "article writer job failed");
    await revertFeatureUsage(job.userId, "article_writer");
    await recordUsageResult(job.userId, "article_writer", 0, "fail");

    job.status = "failed";
    job.error = error instanceof Error ? error.message : "Unknown error";
    job.completedAt = new Date();
    job.metrics = {
      ...(job.metrics || {}),
      durationMs: Date.now() - startedAt,
    };
    await job.save();

    await Audit.create({
      action: "ai.job.failed",
      actor: job.userId,
      targetType: "ai_job",
      targetId: job._id,
      data: {
        type: job.type,
        attempts: job.attempts,
        error: job.error,
      },
    });

    if (job.attempts < job.maxAttempts) {
      job.status = "pending";
      job.error = null;
      await job.save();
      setTimeout(() => {
        void processArticleWriterJob(jobId);
      }, 1000 * job.attempts);
    }
  }
}

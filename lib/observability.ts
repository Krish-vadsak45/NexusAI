import { randomUUID } from "crypto";
import logger from "@/lib/logger";

export type RequestContext = {
  requestId: string;
  startedAt: number;
  path: string;
  method: string;
};

export function createRequestContext(req: Request): RequestContext {
  return {
    requestId: req.headers.get("x-request-id") || randomUUID(),
    startedAt: Date.now(),
    path: new URL(req.url).pathname,
    method: req.method,
  };
}

export function logRequestCompleted(
  context: RequestContext,
  details?: Record<string, unknown>,
) {
  logger.info(
    {
      requestId: context.requestId,
      method: context.method,
      path: context.path,
      durationMs: Date.now() - context.startedAt,
      ...details,
    },
    "request completed",
  );
}

export function logBackgroundMetric(details: Record<string, unknown>) {
  logger.info(details, "background metric");
}

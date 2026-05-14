import { NextResponse } from "next/server";
import { ZodError } from "zod";
import logger from "@/lib/logger";
import { AppError, ValidationError, isAppError } from "./app-error";
import {
  createRequestContext,
  logRequestCompleted,
  type RequestContext,
} from "@/lib/observability";

type RouteContext = {
  params?: Promise<Record<string, string>> | Record<string, string>;
};
type RouteHandler<
  TRequest extends Request = Request,
  TContext extends RouteContext = RouteContext,
> = (req: TRequest, context?: TContext) => Promise<Response>;

function toSerializableError(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }

  return { value: error };
}

function normalizeError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof ZodError) {
    return new ValidationError("Validation failed", {
      details: error.flatten(),
    });
  }

  if (error instanceof SyntaxError) {
    return new ValidationError("Invalid JSON payload", {
      code: "INVALID_JSON",
    });
  }

  return new AppError("Something went wrong", {
    cause: error,
    expose: false,
  });
}

export function handleApiError(
  error: unknown,
  req: Request,
  context?: RequestContext,
) {
  const normalized = normalizeError(error);
  const message = normalized.expose
    ? normalized.message
    : "Internal Server Error";

  logger.error(
    {
      code: normalized.code,
      details: normalized.details,
      error: toSerializableError(normalized.cause ?? normalized),
      method: req.method,
      path: new URL(req.url).pathname,
      requestId: context?.requestId,
      statusCode: normalized.statusCode,
    },
    "API request failed",
  );

  const response = NextResponse.json(
    {
      code: normalized.code,
      details: normalized.details,
      error: message,
    },
    { status: normalized.statusCode },
  );
  if (context) {
    response.headers.set("x-request-id", context.requestId);
    logRequestCompleted(context, {
      statusCode: normalized.statusCode,
      outcome: "error",
    });
  }
  return response;
}

export function withApiHandler<
  TRequest extends Request = Request,
  TContext extends RouteContext = RouteContext,
>(handler: RouteHandler<TRequest, TContext>) {
  return async (req: TRequest, context?: TContext) => {
    const requestContext = createRequestContext(req);
    try {
      const response = await handler(req, context);
      if (response instanceof Response) {
        response.headers.set("x-request-id", requestContext.requestId);
      }
      logRequestCompleted(requestContext, {
        statusCode: response.status,
        outcome: "success",
      });
      return response;
    } catch (error) {
      return handleApiError(error, req, requestContext);
    }
  };
}

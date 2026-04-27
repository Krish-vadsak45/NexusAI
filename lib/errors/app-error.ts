export type AppErrorOptions = {
  cause?: unknown;
  code?: string;
  details?: unknown;
  expose?: boolean;
  statusCode?: number;
};

export class AppError extends Error {
  public readonly cause?: unknown;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly expose: boolean;
  public readonly statusCode: number;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message);
    this.name = new.target.name;
    this.statusCode = options.statusCode ?? 500;
    this.code = options.code ?? "INTERNAL_ERROR";
    this.expose = options.expose ?? this.statusCode < 500;
    this.details = options.details;
    this.cause = options.cause;
  }
}

export class BadRequestError extends AppError {
  constructor(
    message = "Bad request",
    options: Omit<AppErrorOptions, "statusCode"> = {},
  ) {
    super(message, {
      ...options,
      code: options.code ?? "BAD_REQUEST",
      statusCode: 400,
    });
  }
}

export class ValidationError extends AppError {
  constructor(
    message = "Validation failed",
    options: Omit<AppErrorOptions, "statusCode"> = {},
  ) {
    super(message, {
      ...options,
      code: options.code ?? "VALIDATION_ERROR",
      details: options.details,
      statusCode: 400,
    });
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    message = "Unauthorized",
    options: Omit<AppErrorOptions, "statusCode"> = {},
  ) {
    super(message, {
      ...options,
      code: options.code ?? "UNAUTHORIZED",
      statusCode: 401,
    });
  }
}

export class ForbiddenError extends AppError {
  constructor(
    message = "Forbidden",
    options: Omit<AppErrorOptions, "statusCode"> = {},
  ) {
    super(message, {
      ...options,
      code: options.code ?? "FORBIDDEN",
      statusCode: 403,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(
    message = "Not found",
    options: Omit<AppErrorOptions, "statusCode"> = {},
  ) {
    super(message, {
      ...options,
      code: options.code ?? "NOT_FOUND",
      statusCode: 404,
    });
  }
}

export class ConflictError extends AppError {
  constructor(
    message = "Conflict",
    options: Omit<AppErrorOptions, "statusCode"> = {},
  ) {
    super(message, {
      ...options,
      code: options.code ?? "CONFLICT",
      statusCode: 409,
    });
  }
}

export class RateLimitError extends AppError {
  constructor(
    message = "Too many requests",
    options: Omit<AppErrorOptions, "statusCode"> = {},
  ) {
    super(message, {
      ...options,
      code: options.code ?? "RATE_LIMITED",
      statusCode: 429,
    });
  }
}

export class ExternalServiceError extends AppError {
  constructor(
    message = "External service request failed",
    options: Omit<AppErrorOptions, "statusCode"> = {},
  ) {
    super(message, {
      ...options,
      code: options.code ?? "EXTERNAL_SERVICE_ERROR",
      expose: options.expose ?? false,
      statusCode: 502,
    });
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

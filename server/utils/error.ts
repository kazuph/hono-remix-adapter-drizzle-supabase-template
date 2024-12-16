import { Context } from "hono";
import { StatusCode } from "hono/utils/http-status";
import { z } from "zod";

export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export function createErrorResponse(error: unknown): ApiError {
  if (error instanceof z.ZodError) {
    return {
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      details: error.errors,
    };
  }

  if (error instanceof Error) {
    return {
      code: error.name,
      message: error.message,
      details: error.stack,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: String(error),
  };
}

export function handleError(c: Context, error: unknown, status: StatusCode = 500) {
  console.error("API Error:", error);
  return c.json(createErrorResponse(error), status);
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

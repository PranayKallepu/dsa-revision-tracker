import "server-only"
import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { Prisma } from "@prisma/client"
import { logger } from "../utils/logger"
import type { ApiErrorResponse } from "@/types/api"

export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

export type HttpStatusCode = (typeof HttpStatus)[keyof typeof HttpStatus]

/**
 * Base Application Error class for controlled HTTP error responses.
 */
export class AppError extends Error {
  public readonly statusCode: HttpStatusCode
  public readonly code: string
  public readonly details?: unknown
  public readonly isOperational: boolean

  constructor(
    message: string,
    statusCode: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    code = "INTERNAL_SERVER_ERROR",
    details?: unknown,
  ) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.code = code
    this.details = details
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad Request", details?: unknown) {
    super(message, HttpStatus.BAD_REQUEST, "BAD_REQUEST", details)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, HttpStatus.UNAUTHORIZED, "UNAUTHORIZED")
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, HttpStatus.FORBIDDEN, "FORBIDDEN")
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource", identifier?: string | number) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' was not found.`
      : `${resource} not found.`
    super(message, HttpStatus.NOT_FOUND, "NOT_FOUND")
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict occurred", details?: unknown) {
    super(message, HttpStatus.CONFLICT, "CONFLICT", details)
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: unknown) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY, "VALIDATION_ERROR", details)
  }
}

export class InternalServerError extends AppError {
  constructor(message = "An unexpected error occurred", details?: unknown) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", details)
  }
}

/**
 * Centralized API Error handler for Next.js Route Handlers.
 * Transforms domain errors, Zod validation errors, and Prisma errors
 * into consistent JSON error responses with appropriate status codes.
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  const timestamp = new Date().toISOString()

  // 1. Handled Domain AppError
  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      logger.error(`[AppError ${error.statusCode}] ${error.message}`, error, error.details)
    } else {
      logger.warn(`[AppError ${error.statusCode}] ${error.message}`, { details: error.details })
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        timestamp,
      },
      { status: error.statusCode },
    )
  }

  // 2. Zod Validation Errors
  if (error instanceof ZodError) {
    const formattedDetails = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    }))

    logger.warn("[ValidationError] Request validation failed", { issues: formattedDetails })

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed. Please review the provided fields.",
          details: formattedDetails,
        },
        timestamp,
      },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
    )
  }

  // 3. Prisma Known Request Errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error(`[PrismaError ${error.code}] Database error occurred`, error)

    if (error.code === "P2002") {
      const target = (error.meta?.target as string[])?.join(", ") || "field"
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNIQUE_CONSTRAINT_VIOLATION",
            message: `A record with this ${target} already exists.`,
            details: error.meta,
          },
          timestamp,
        },
        { status: HttpStatus.CONFLICT },
      )
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RECORD_NOT_FOUND",
            message: "The requested record was not found.",
            details: error.meta,
          },
          timestamp,
        },
        { status: HttpStatus.NOT_FOUND },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "A database error occurred while processing your request.",
        },
        timestamp,
      },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    )
  }

  // 4. Prisma Connection or Initialization Errors
  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError
  ) {
    logger.error("[PrismaClientError] Failed to connect to database", error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_UNAVAILABLE",
          message: "Database connection could not be established.",
        },
        timestamp,
      },
      { status: HttpStatus.SERVICE_UNAVAILABLE },
    )
  }

  // 5. Unhandled / Unexpected Errors
  logger.error("[UnhandledException] Unexpected server error", error)

  const isDev = process.env.NODE_ENV === "development"
  const errorMessage = isDev && error instanceof Error ? error.message : "An unexpected server error occurred."

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: errorMessage,
        ...(isDev && error instanceof Error ? { stack: error.stack } : {}),
      },
      timestamp,
    },
    { status: HttpStatus.INTERNAL_SERVER_ERROR },
  )
}


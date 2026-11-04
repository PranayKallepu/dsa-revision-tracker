import "server-only"
import { NextResponse } from "next/server"
import type { ApiSuccessResponse, PaginatedData, PaginationMeta } from "@/types/api"

/**
 * Creates a standardized JSON success response.
 *
 * @param data - Payload to return to the client
 * @param status - HTTP status code (defaults to 200)
 * @param message - Optional human-readable message
 */
export function successResponse<T>(
  data: T,
  status = 200,
  message?: string,
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message ? { message } : {}),
      timestamp: new Date().toISOString(),
    },
    { status },
  )
}

/**
 * Creates a standardized paginated JSON success response.
 *
 * @param items - Array of page items
 * @param meta - Pagination metadata (page, limit, total, totalPages, hasMore)
 * @param status - HTTP status code (defaults to 200)
 * @param message - Optional human-readable message
 */
export function paginatedResponse<T>(
  items: T[],
  meta: PaginationMeta,
  status = 200,
  message?: string,
): NextResponse<ApiSuccessResponse<PaginatedData<T>>> {
  return successResponse<PaginatedData<T>>(
    {
      items,
      meta,
    },
    status,
    message,
  )
}

/**
 * Creates a 204 No Content response.
 */
export function noContentResponse(): NextResponse<null> {
  return new NextResponse(null, { status: 204 })
}


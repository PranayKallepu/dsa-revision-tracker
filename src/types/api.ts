/**
 * Standard API Response contracts for backend route handlers.
 */

export interface ApiSuccessResponse<T = unknown> {
  success: true
  data: T
  message?: string
  timestamp: string
}

export interface ApiErrorDetail {
  field?: string
  message: string
  code?: string
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
  timestamp: string
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface PaginatedData<T> {
  items: T[]
  meta: PaginationMeta
}


import "server-only"
import { prisma } from "@/lib/prisma"
import type { PaginationMeta } from "@/types/api"

/**
 * Base repository providing shared database client access and pagination calculation helpers.
 */
export abstract class BaseRepository {
  protected readonly db = prisma

  /**
   * Calculates pagination metadata based on total items, page number, and page size limit.
   */
  protected calculatePagination(total: number, page: number, limit: number): PaginationMeta {
    const totalPages = Math.max(1, Math.ceil(total / limit))
    return {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    }
  }

  /**
   * Calculates offset (skip) for SQL / Prisma queries.
   */
  protected calculateSkip(page: number, limit: number): number {
    return Math.max(0, (page - 1) * limit)
  }
}


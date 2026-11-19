import "server-only"
import { type NextRequest } from "next/server"
import {
  handleApiError,
  HttpStatus,
  paginatedResponse,
  parseAndValidateJson,
  problemService,
  requireAuth,
  successResponse,
  validateQueryParams,
} from "@/server"
import {
  createProblemSchema,
  listProblemsQuerySchema,
} from "@/server/validators/problem.schema"

/**
 * GET /api/problems
 * Lists user-owned problems with search, filtering, and pagination.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const query = validateQueryParams(request.nextUrl.searchParams, listProblemsQuerySchema)
    const result = await problemService.listProblems(user.id, query)

    return paginatedResponse(
      result.items,
      result.meta,
      HttpStatus.OK,
      "Problems retrieved successfully",
    )
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/problems
 * Creates a new problem record owned by the authenticated user.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const input = await parseAndValidateJson(request, createProblemSchema)
    const problem = await problemService.createProblem(user.id, input)

    return successResponse(
      problem,
      HttpStatus.CREATED,
      "Problem created successfully",
    )
  } catch (error) {
    return handleApiError(error)
  }
}


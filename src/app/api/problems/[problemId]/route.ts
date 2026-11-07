import "server-only"
import { type NextRequest } from "next/server"
import {
  handleApiError,
  HttpStatus,
  parseAndValidateJson,
  problemService,
  requireAuth,
  successResponse,
} from "@/server"
import { updateProblemSchema } from "@/server/validators/problem.schema"

interface RouteParams {
  params: Promise<{ problemId: string }>
}

/**
 * GET /api/problems/[problemId]
 * Retrieves details for a specific user-owned problem.
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const user = await requireAuth()
    const { problemId } = await params
    const problem = await problemService.getProblemById(problemId, user.id)

    return successResponse(
      problem,
      HttpStatus.OK,
      "Problem retrieved successfully",
    )
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PATCH /api/problems/[problemId]
 * Updates fields of an existing user-owned problem.
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const user = await requireAuth()
    const { problemId } = await params
    const input = await parseAndValidateJson(request, updateProblemSchema)
    const updated = await problemService.updateProblem(problemId, user.id, input)

    return successResponse(
      updated,
      HttpStatus.OK,
      "Problem updated successfully",
    )
  } catch (error) {
    return handleApiError(error)
  }
}


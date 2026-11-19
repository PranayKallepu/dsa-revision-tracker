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
import { problemSolutionInputSchema } from "@/server/validators/problem.schema"

interface RouteParams {
  params: Promise<{ problemId: string }>
}

/**
 * POST /api/problems/[problemId]/solutions
 * Adds a new solution (e.g. OPTIMIZED or BRUTE_FORCE) to an existing user-owned problem.
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const user = await requireAuth()
    const { problemId } = await params
    const input = await parseAndValidateJson(request, problemSolutionInputSchema)
    const solution = await problemService.addSolution(problemId, user.id, input)

    return successResponse(
      solution,
      HttpStatus.CREATED,
      "Solution added successfully",
    )
  } catch (error) {
    return handleApiError(error)
  }
}

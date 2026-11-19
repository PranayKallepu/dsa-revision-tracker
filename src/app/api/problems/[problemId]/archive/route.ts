import "server-only"
import { type NextRequest } from "next/server"
import {
  handleApiError,
  HttpStatus,
  problemService,
  requireAuth,
  successResponse,
} from "@/server"

interface RouteParams {
  params: Promise<{ problemId: string }>
}

/**
 * PATCH /api/problems/[problemId]/archive
 * Archives a user-owned problem (sets archivedAt and status to ARCHIVED).
 */
export async function PATCH(
  _request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const user = await requireAuth()
    const { problemId } = await params
    const archived = await problemService.archiveProblem(problemId, user.id)

    return successResponse(
      archived,
      HttpStatus.OK,
      "Problem archived successfully",
    )
  } catch (error) {
    return handleApiError(error)
  }
}


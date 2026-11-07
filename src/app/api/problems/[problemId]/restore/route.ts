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
 * PATCH /api/problems/[problemId]/restore
 * Restores an archived user-owned problem (clears archivedAt and sets status to LEARNING).
 */
export async function PATCH(
  _request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const user = await requireAuth()
    const { problemId } = await params
    const restored = await problemService.restoreProblem(problemId, user.id)

    return successResponse(
      restored,
      HttpStatus.OK,
      "Problem restored successfully",
    )
  } catch (error) {
    return handleApiError(error)
  }
}


import { handleApiError, HttpStatus, parseAndValidateJson, registerSchema, successResponse } from "@/server"
import { AuthService } from "@/server/services/auth.service"

export const dynamic = "force-dynamic"

/**
 * User Registration Endpoint
 * POST /api/auth/register
 */
export async function POST(request: Request) {
  try {
    const input = await parseAndValidateJson(request, registerSchema)
    const user = await AuthService.register(input)

    return successResponse(
      user,
      HttpStatus.CREATED,
      "Account registered successfully. You may now sign in.",
    )
  } catch (error) {
    return handleApiError(error)
  }
}


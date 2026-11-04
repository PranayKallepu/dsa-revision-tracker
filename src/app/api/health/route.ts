import { handleApiError, HttpStatus, successResponse } from "@/server"
import { HealthService } from "@/server/services/health.service"

export const dynamic = "force-dynamic"

/**
 * Health check endpoint.
 * Evaluates server uptime and database connectivity.
 *
 * GET /api/health
 */
export async function GET() {
  try {
    const health = await HealthService.check()
    const status = health.status === "healthy" ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE

    return successResponse(
      health,
      status,
      health.status === "healthy" ? "Service is fully operational" : "Service is degraded (database unavailable)",
    )
  } catch (error) {
    return handleApiError(error)
  }
}


import "server-only"
import { prisma } from "@/lib/prisma"
import { logger } from "../utils/logger"

export interface DatabaseHealth {
  status: "connected" | "disconnected"
  latencyMs?: number
  error?: string
}

export interface HealthCheckResult {
  status: "healthy" | "degraded"
  database: DatabaseHealth
  uptime: number
  environment: string
  timestamp: string
}

export class HealthService {
  /**
   * Performs an asynchronous health check covering database connectivity and server uptime.
   * Uses a 3-second timeout for the database query to avoid hanging if the DB is unreachable.
   */
  public static async check(): Promise<HealthCheckResult> {
    const startTime = Date.now()
    let dbStatus: DatabaseHealth = { status: "disconnected" }

    try {
      // 3-second timeout promise
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Database connection timed out after 3000ms")), 3000),
      )

      // Raw query to test connection
      const queryPromise = prisma.$queryRaw`SELECT 1 as result`

      await Promise.race([queryPromise, timeoutPromise])

      const latencyMs = Date.now() - startTime
      dbStatus = {
        status: "connected",
        latencyMs,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      logger.warn("[HealthCheck] Database check failed", { error: errorMessage })
      dbStatus = {
        status: "disconnected",
        error: errorMessage,
      }
    }

    const isHealthy = dbStatus.status === "connected"

    return {
      status: isHealthy ? "healthy" : "degraded",
      database: dbStatus,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    }
  }
}


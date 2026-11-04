import "server-only"

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogPayload {
  level: LogLevel
  message: string
  timestamp: string
  context?: unknown
  error?: {
    name?: string
    message: string
    stack?: string
  }
}

function formatLog(payload: LogPayload): string {
  const isDev = process.env.NODE_ENV === "development"

  if (isDev) {
    const time = payload.timestamp.slice(11, 19)
    const prefix = `[${time}] [${payload.level.toUpperCase()}]`
    const details = payload.context ? ` ${JSON.stringify(payload.context)}` : ""
    const err = payload.error ? `\n  Error: ${payload.error.message}${payload.error.stack ? `\n${payload.error.stack}` : ""}` : ""
    return `${prefix} ${payload.message}${details}${err}`
  }

  // Structured JSON in production for log aggregators (e.g. Datadog, CloudWatch, GCP Logging)
  return JSON.stringify(payload)
}

function normalizeError(error?: unknown): { name?: string; message: string; stack?: string } | undefined {
  if (!error) return undefined

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }

  return {
    message: String(error),
  }
}

/**
 * Server-side structured logger for Route Handlers and Services.
 * Cannot be imported or bundled into client components.
 */
class ServerLogger {
  private shouldLog(level: LogLevel): boolean {
    if (process.env.NODE_ENV === "test") {
      return false
    }
    // Only show debug logs in development or when DEBUG=true
    if (level === "debug" && process.env.NODE_ENV !== "development" && !process.env.DEBUG) {
      return false
    }
    return true
  }

  public debug(message: string, context?: unknown): void {
    if (!this.shouldLog("debug")) return
    const payload: LogPayload = {
      level: "debug",
      message,
      timestamp: new Date().toISOString(),
      context,
    }
    console.debug(formatLog(payload))
  }

  public info(message: string, context?: unknown): void {
    if (!this.shouldLog("info")) return
    const payload: LogPayload = {
      level: "info",
      message,
      timestamp: new Date().toISOString(),
      context,
    }
    console.info(formatLog(payload))
  }

  public warn(message: string, context?: unknown): void {
    if (!this.shouldLog("warn")) return
    const payload: LogPayload = {
      level: "warn",
      message,
      timestamp: new Date().toISOString(),
      context,
    }
    console.warn(formatLog(payload))
  }

  public error(message: string, error?: unknown, context?: unknown): void {
    if (!this.shouldLog("error")) return
    const payload: LogPayload = {
      level: "error",
      message,
      timestamp: new Date().toISOString(),
      error: normalizeError(error),
      context,
    }
    console.error(formatLog(payload))
  }
}

export const logger = new ServerLogger()


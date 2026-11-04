import "server-only"
import { PrismaClient } from "@prisma/client"

/**
 * Global singleton pattern to prevent multiple PrismaClient instances
 * across hot-reloads in Next.js development mode.
 *
 * Notice: 'server-only' ensures this module cannot be imported by
 * any client component or client-side bundle.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

export default prisma


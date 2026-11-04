import "server-only"
import { auth } from "@/auth"
import { UnauthorizedError } from "../errors/app-error"

export interface AuthenticatedUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

/**
 * Retrieves the currently authenticated user from the active session.
 * Throws UnauthorizedError (HTTP 401) if no active session exists.
 *
 * Use this in route handlers, server actions, and protected server workflows
 * to enforce user identity without trusting client-submitted identifiers.
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const session = await auth()

  if (!session?.user?.id) {
    throw new UnauthorizedError("Authentication required. Please sign in.")
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  }
}

/**
 * Optionally retrieves the authenticated user without throwing if unauthenticated.
 */
export async function getOptionalAuth(): Promise<AuthenticatedUser | null> {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  }
}


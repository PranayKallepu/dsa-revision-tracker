import "server-only"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { ConflictError } from "../errors/app-error"
import { logger } from "../utils/logger"
import type { RegisterInput } from "../validators/auth.schema"

export interface SafeUser {
  id: string
  name: string | null
  email: string
  createdAt: Date
}

export class AuthService {
  /**
   * Registers a new user with email and hashed password.
   * Enforces email uniqueness and password hashing via bcrypt (cost factor 12).
   */
  public static async register(input: RegisterInput): Promise<SafeUser> {
    const normalizedEmail = input.email.toLowerCase().trim()

    // Check for existing user
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      logger.warn("[Auth] Registration failed: email already registered", { email: normalizedEmail })
      throw new ConflictError("An account with this email address already exists.")
    }

    // Hash password with bcrypt (cost factor 12)
    const passwordHash = await bcrypt.hash(input.password, 12)

    const user = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email: normalizedEmail,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    logger.info("[Auth] User registered successfully", { userId: user.id, email: user.email })

    return user
  }

  /**
   * Retrieves a user by their unique email address.
   */
  public static async getUserByEmail(email: string) {
    const normalizedEmail = email.toLowerCase().trim()
    return prisma.user.findUnique({
      where: { email: normalizedEmail },
    })
  }

  /**
   * Retrieves a user by their unique identifier.
   */
  public static async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    })
  }
}


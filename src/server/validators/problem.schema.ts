import "server-only"
import { z } from "zod"
import { Difficulty, Platform, ProblemStatus } from "@prisma/client"
import { paginationQuerySchema } from "./validate"

// Helper to normalize difficulty input to Prisma Difficulty enum
export const difficultyInputSchema = z.preprocess((val) => {
  if (typeof val === "string") {
    const upper = val.toUpperCase().trim()
    if (upper === "EASY") return Difficulty.EASY
    if (upper === "MEDIUM") return Difficulty.MEDIUM
    if (upper === "HARD") return Difficulty.HARD
  }
  return val
}, z.nativeEnum(Difficulty, {
  message: "Difficulty must be Easy, Medium, or Hard",
}))

// Helper to normalize platform input to Prisma Platform enum
export const platformInputSchema = z.preprocess((val) => {
  if (typeof val === "string") {
    const cleaned = val.toUpperCase().replace(/[\s\-_]/g, "").trim()
    if (cleaned === "LEETCODE") return Platform.LEETCODE
    if (cleaned === "GEEKSFORGEEKS" || cleaned === "GFG") return Platform.GEEKSFORGEEKS
    if (cleaned === "HACKERRANK") return Platform.HACKERRANK
    if (cleaned === "CODEFORCES") return Platform.CODEFORCES
    if (cleaned === "INTERVIEWBIT") return Platform.INTERVIEWBIT
    if (cleaned === "OTHER") return Platform.OTHER
  }
  return val
}, z.nativeEnum(Platform, {
  message: "Platform must be a recognized platform (LeetCode, GeeksforGeeks, HackerRank, Codeforces, InterviewBit, or Other)",
}))

// Helper to normalize status input to Prisma ProblemStatus enum
export const problemStatusInputSchema = z.preprocess((val) => {
  if (typeof val === "string") {
    const upper = val.toUpperCase().trim()
    if (upper === "LEARNING") return ProblemStatus.LEARNING
    if (upper === "MASTERED") return ProblemStatus.MASTERED
    if (upper === "OVERDUE") return ProblemStatus.OVERDUE
    if (upper === "ARCHIVED") return ProblemStatus.ARCHIVED
  }
  return val
}, z.nativeEnum(ProblemStatus, {
  message: "Status must be Learning, Mastered, Overdue, or Archived",
}))

/**
 * URL validator that allows both bare domains (leetcode.com/...) and full URLs (https://...)
 */
const urlSchema = z
  .string()
  .trim()
  .min(1, "Problem URL is required")
  .refine((val) => {
    try {
      const testUrl =
        val.startsWith("http://") || val.startsWith("https://")
          ? val
          : `https://${val}`
      const parsed = new URL(testUrl)
      return parsed.hostname.includes(".")
    } catch {
      return false
    }
  }, "Please enter a valid URL (e.g. https://leetcode.com/problems/...)")

/**
 * Schema for creating a new problem.
 * Disallows id, userId, archivedAt, createdAt, updatedAt from client.
 */
export const createProblemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Problem title is required")
    .max(200, "Title must be under 200 characters"),
  url: urlSchema,
  platform: platformInputSchema,
  difficulty: difficultyInputSchema,
  status: problemStatusInputSchema.optional().default(ProblemStatus.LEARNING),
  topics: z
    .array(z.string().trim().min(1, "Topic name cannot be empty"))
    .min(1, "Please provide at least one topic tag"),
  approach: z.string().trim().optional().nullable(),
  timeComplexity: z.string().trim().optional().nullable(),
  spaceComplexity: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  mistakes: z.string().trim().optional().nullable(),
  initialSolveDurationSeconds: z.preprocess((val) => {
    if (val === undefined || val === null || val === "") return undefined
    return Number(val)
  }, z.number().int().min(0, "Duration cannot be negative").max(86400, "Duration cannot exceed 24 hours").optional().nullable()),
  // Support 'time' field in minutes from frontend as convenience
  time: z.preprocess((val) => {
    if (val === undefined || val === null || val === "") return undefined
    return Number(val)
  }, z.number().min(0).max(1440).optional()),
  originalSolvedAt: z.preprocess((val) => {
    if (typeof val === "string" && val.trim()) {
      const parsed = new Date(val)
      return isNaN(parsed.getTime()) ? undefined : parsed
    }
    return val
  }, z.date().optional()),
}).strict()

export type CreateProblemInput = z.infer<typeof createProblemSchema>

/**
 * Schema for updating an existing problem.
 * Partial fields, strict rejection of identity/system fields.
 */
export const updateProblemSchema = createProblemSchema.partial().strict()

export type UpdateProblemInput = z.infer<typeof updateProblemSchema>

/**
 * Schema for listing problems with query parameters (search, filter, pagination).
 */
export const listProblemsQuerySchema = paginationQuerySchema.extend({
  difficulty: z.preprocess((val) => {
    if (typeof val === "string" && val.toUpperCase() !== "ALL") {
      const upper = val.toUpperCase().trim()
      if (upper === "EASY") return Difficulty.EASY
      if (upper === "MEDIUM") return Difficulty.MEDIUM
      if (upper === "HARD") return Difficulty.HARD
    }
    return undefined
  }, z.nativeEnum(Difficulty).optional()),
  platform: z.preprocess((val) => {
    if (typeof val === "string" && val.toUpperCase() !== "ALL") {
      const cleaned = val.toUpperCase().replace(/[\s\-_]/g, "").trim()
      if (cleaned === "LEETCODE") return Platform.LEETCODE
      if (cleaned === "GEEKSFORGEEKS" || cleaned === "GFG") return Platform.GEEKSFORGEEKS
      if (cleaned === "HACKERRANK") return Platform.HACKERRANK
      if (cleaned === "CODEFORCES") return Platform.CODEFORCES
      if (cleaned === "INTERVIEWBIT") return Platform.INTERVIEWBIT
      if (cleaned === "OTHER") return Platform.OTHER
    }
    return undefined
  }, z.nativeEnum(Platform).optional()),
  topic: z.preprocess((val) => {
    if (typeof val === "string" && val.toUpperCase() !== "ALL" && val.trim() !== "") {
      return val.trim()
    }
    return undefined
  }, z.string().optional()),
  status: z.preprocess((val) => {
    if (typeof val === "string" && val.toUpperCase() !== "ALL") {
      const upper = val.toUpperCase().trim()
      if (upper === "LEARNING") return ProblemStatus.LEARNING
      if (upper === "MASTERED") return ProblemStatus.MASTERED
      if (upper === "OVERDUE") return ProblemStatus.OVERDUE
      if (upper === "ARCHIVED") return ProblemStatus.ARCHIVED
    }
    return undefined
  }, z.nativeEnum(ProblemStatus).optional()),
  archived: z.preprocess((val) => {
    if (typeof val === "string") {
      const lower = val.toLowerCase().trim()
      if (lower === "true" || lower === "1") return true
      if (lower === "false" || lower === "0") return false
    }
    if (typeof val === "boolean") return val
    return undefined
  }, z.boolean().optional()),
})

export type ListProblemsQuery = z.infer<typeof listProblemsQuerySchema>

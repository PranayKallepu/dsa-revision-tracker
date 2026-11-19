import "server-only"
import { Difficulty, Platform, ProblemStatus } from "@prisma/client"
import { NotFoundError } from "../errors/app-error"
import {
  problemRepository,
  type ProblemSummaryWithRelations,
  type ProblemWithRelations,
} from "../repositories/problem.repository"
import type {
  CreateProblemInput,
  ListProblemsQuery,
  UpdateProblemInput,
} from "../validators/problem.schema"
import type { PaginationMeta } from "@/types/api"

/**
 * Transforms Prisma Difficulty enum to frontend Title Case.
 */
export function formatDifficulty(diff: Difficulty): "Easy" | "Medium" | "Hard" {
  switch (diff) {
    case Difficulty.EASY:
      return "Easy"
    case Difficulty.MEDIUM:
      return "Medium"
    case Difficulty.HARD:
      return "Hard"
    default:
      return "Medium"
  }
}

/**
 * Transforms Prisma Platform enum to frontend standard naming.
 */
export function formatPlatform(plat: Platform): string {
  switch (plat) {
    case Platform.LEETCODE:
      return "LeetCode"
    case Platform.GEEKSFORGEEKS:
      return "GeeksforGeeks"
    case Platform.HACKERRANK:
      return "HackerRank"
    case Platform.CODEFORCES:
      return "Codeforces"
    case Platform.INTERVIEWBIT:
      return "InterviewBit"
    case Platform.OTHER:
    default:
      return "Other"
  }
}

/**
 * Transforms Prisma ProblemStatus enum to frontend Title Case.
 */
export function formatProblemStatus(
  status: ProblemStatus,
): "Learning" | "Mastered" | "Overdue" | "Archived" {
  switch (status) {
    case ProblemStatus.LEARNING:
      return "Learning"
    case ProblemStatus.MASTERED:
      return "Mastered"
    case ProblemStatus.OVERDUE:
      return "Overdue"
    case ProblemStatus.ARCHIVED:
      return "Archived"
    default:
      return "Learning"
  }
}

/**
 * Formats a problem entity into a clean, client-friendly DTO.
 */
export function formatProblemDto(problem: ProblemWithRelations | ProblemSummaryWithRelations) {
  const topics = problem.topics.map((pt) => pt.topic.name)
  const completedRevisions = "revisions" in problem ? problem.revisions.length : 0
  const solveMinutes = problem.initialSolveDurationSeconds
    ? Math.round(problem.initialSolveDurationSeconds / 60)
    : 30

  // Determine next revision text
  let nextRevision = "Today"
  if (problem.status === ProblemStatus.ARCHIVED) {
    nextRevision = "—"
  } else if (problem.status === ProblemStatus.MASTERED) {
    nextRevision = "Mastered"
  } else if ("revisions" in problem && problem.revisions && problem.revisions.length > 0) {
    // If there is an active pending revision, format its scheduled date
    const pending = problem.revisions.find((r) => r.status === "PENDING")
    if (pending) {
      const scheduled = new Date(pending.scheduledAt)
      const now = new Date()
      const diffDays = Math.ceil((scheduled.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays <= 0) nextRevision = "Today"
      else if (diffDays === 1) nextRevision = "Tomorrow"
      else {
        nextRevision = scheduled.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      }
    }
  }

  return {
    id: problem.id,
    title: problem.title,
    url: problem.url,
    difficulty: formatDifficulty(problem.difficulty),
    rawDifficulty: problem.difficulty,
    platform: formatPlatform(problem.platform),
    rawPlatform: problem.platform,
    status: formatProblemStatus(problem.status),
    rawStatus: problem.status,
    topics,
    time: solveMinutes,
    initialSolveDurationSeconds: problem.initialSolveDurationSeconds,
    approach: problem.approach || "",
    timeComplexity: problem.timeComplexity || "",
    spaceComplexity: problem.spaceComplexity || "",
    notes: problem.notes || "",
    mistakes: problem.mistakes || "",
    nextRevision,
    revision: completedRevisions,
    originalSolveDate: problem.originalSolvedAt.toISOString(),
    archivedAt: problem.archivedAt?.toISOString() || null,
    createdAt: problem.createdAt.toISOString(),
    updatedAt: problem.updatedAt.toISOString(),
    attempts: "attempts" in problem ? problem.attempts.map((a) => ({
      id: a.id,
      problemId: a.problemId,
      revisionId: a.revisionId || undefined,
      duration: Math.round(a.durationSeconds / 60),
      durationSeconds: a.durationSeconds,
      timeSpent: Math.round(a.durationSeconds / 60),
      createdDate: a.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      createdAt: a.createdAt.toISOString(),
    })) : [],
    revisions: "revisions" in problem ? problem.revisions.map((r) => ({
      id: r.id,
      problemId: r.problemId,
      cycleNumber: r.cycleNumber,
      revisionNumber: r.revisionNumber,
      scheduledDate: r.scheduledAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      scheduledAt: r.scheduledAt.toISOString(),
      completionDate: r.completedAt
        ? r.completedAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : undefined,
      completedAt: r.completedAt?.toISOString(),
      status: r.status.toLowerCase(),
      rating: r.rating ? r.rating.charAt(0) + r.rating.slice(1).toLowerCase() : undefined,
    })) : [],
  }
}

export class ProblemService {
  /**
   * Retrieves a paginated list of user-owned problems with applied filters.
   */
  async listProblems(
    userId: string,
    query: ListProblemsQuery,
  ): Promise<{ items: ReturnType<typeof formatProblemDto>[]; meta: PaginationMeta }> {
    const { items, meta } = await problemRepository.findMany(userId, query)
    const formatted = items.map((p) => formatProblemDto(p))
    return { items: formatted, meta }
  }

  /**
   * Retrieves a single problem by ID, strictly enforcing user ownership.
   * Throws NotFoundError if not found or belongs to another user.
   */
  async getProblemById(id: string, userId: string) {
    const problem = await problemRepository.findById(id, userId)

    if (!problem) {
      throw new NotFoundError("Problem", id)
    }

    return formatProblemDto(problem)
  }

  /**
   * Creates a new user-owned problem with topic tags and initial parameters.
   */
  async createProblem(userId: string, input: CreateProblemInput) {
    // Calculate initial duration in seconds
    let durationSeconds: number | null = null
    if (input.initialSolveDurationSeconds !== undefined && input.initialSolveDurationSeconds !== null) {
      durationSeconds = input.initialSolveDurationSeconds
    } else if (input.time !== undefined && input.time !== null) {
      durationSeconds = Math.round(input.time * 60)
    }

    // Resolve or create topic tag records
    const topicIds = await problemRepository.resolveOrCreateTopics(userId, input.topics)

    const created = await problemRepository.create(
      userId,
      {
        title: input.title,
        url: input.url,
        platform: input.platform,
        difficulty: input.difficulty,
        status: input.status,
        approach: input.approach,
        timeComplexity: input.timeComplexity,
        spaceComplexity: input.spaceComplexity,
        notes: input.notes,
        mistakes: input.mistakes,
        initialSolveDurationSeconds: durationSeconds,
        originalSolvedAt: input.originalSolvedAt,
      },
      topicIds,
    )

    return formatProblemDto(created)
  }

  /**
   * Updates an existing user-owned problem.
   * Throws NotFoundError if not found or belongs to another user.
   */
  async updateProblem(id: string, userId: string, input: UpdateProblemInput) {
    // Ownership check
    const existing = await problemRepository.findById(id, userId)
    if (!existing) {
      throw new NotFoundError("Problem", id)
    }

    // Resolve topic IDs if new topics were provided
    let topicIds: string[] | undefined = undefined
    if (input.topics !== undefined) {
      topicIds = await problemRepository.resolveOrCreateTopics(userId, input.topics)
    }

    // Calculate duration in seconds if changed
    let durationSeconds: number | null | undefined = undefined
    if (input.initialSolveDurationSeconds !== undefined) {
      durationSeconds = input.initialSolveDurationSeconds
    } else if (input.time !== undefined) {
      durationSeconds = Math.round(input.time * 60)
    }

    const updated = await problemRepository.update(
      id,
      userId,
      {
        title: input.title,
        url: input.url,
        platform: input.platform,
        difficulty: input.difficulty,
        status: input.status,
        approach: input.approach,
        timeComplexity: input.timeComplexity,
        spaceComplexity: input.spaceComplexity,
        notes: input.notes,
        mistakes: input.mistakes,
        initialSolveDurationSeconds: durationSeconds,
        originalSolvedAt: input.originalSolvedAt,
      },
      topicIds,
    )

    if (!updated) {
      throw new NotFoundError("Problem", id)
    }

    return formatProblemDto(updated)
  }

  /**
   * Archives a user-owned problem.
   * Throws NotFoundError if not found or belongs to another user.
   */
  async archiveProblem(id: string, userId: string) {
    const archived = await problemRepository.archive(id, userId)
    if (!archived) {
      throw new NotFoundError("Problem", id)
    }
    return formatProblemDto(archived)
  }

  /**
   * Restores an archived user-owned problem.
   * Throws NotFoundError if not found or belongs to another user.
   */
  async restoreProblem(id: string, userId: string) {
    const restored = await problemRepository.restore(id, userId)
    if (!restored) {
      throw new NotFoundError("Problem", id)
    }
    return formatProblemDto(restored)
  }
}

export const problemService = new ProblemService()


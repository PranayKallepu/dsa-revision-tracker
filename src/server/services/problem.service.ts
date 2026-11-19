import "server-only"
import { Difficulty, Platform, ProblemSolvingStatus, ProblemStatus, SolutionType } from "@prisma/client"
import { NotFoundError } from "../errors/app-error"
import {
  problemRepository,
  type ProblemSummaryWithRelations,
  type ProblemWithRelations,
} from "../repositories/problem.repository"
import type {
  CreateProblemInput,
  ListProblemsQuery,
  ProblemBlockerInput,
  ProblemSolutionInput,
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
  const completedRevisions = "revisions" in problem && problem.revisions ? problem.revisions.length : 0
  const solveSeconds = problem.timeSpentSeconds ?? problem.initialSolveDurationSeconds
  const solveMinutes = solveSeconds ? Math.round(solveSeconds / 60) : 30

  // Determine next revision text
  let nextRevision = "Today"
  if (problem.solvingStatus === ProblemSolvingStatus.NOT_SOLVED) {
    nextRevision = "Unsolved"
  } else if (problem.status === ProblemStatus.ARCHIVED) {
    nextRevision = "—"
  } else if (problem.isMastered || problem.status === ProblemStatus.MASTERED) {
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
    solvingStatus: problem.solvingStatus,
    rawSolvingStatus: problem.solvingStatus,
    status: formatProblemStatus(problem.status),
    rawStatus: problem.status,
    isMastered: problem.isMastered,
    masteredAt: problem.masteredAt ? problem.masteredAt.toISOString() : null,
    currentCycle: problem.currentCycle,
    topics,
    time: solveMinutes,
    timeSpentSeconds: solveSeconds,
    timeSpentMinutes: solveMinutes,
    initialSolveDurationSeconds: problem.initialSolveDurationSeconds,
    approach: problem.approach || "",
    timeComplexity: problem.timeComplexity || "",
    spaceComplexity: problem.spaceComplexity || "",
    notes: problem.notes || "",
    mistakes: problem.mistakes || "",
    nextRevision,
    revision: problem.solvingStatus === ProblemSolvingStatus.NOT_SOLVED ? 0 : completedRevisions,
    originalSolveDate: problem.originalSolvedAt ? problem.originalSolvedAt.toISOString() : null,
    archivedAt: problem.archivedAt?.toISOString() || null,
    createdAt: problem.createdAt.toISOString(),
    updatedAt: problem.updatedAt.toISOString(),
    solutions: "solutions" in problem && problem.solutions ? problem.solutions.map((s) => ({
      id: s.id,
      problemId: s.problemId,
      solutionType: s.solutionType,
      approach: s.approach,
      timeComplexity: s.timeComplexity,
      spaceComplexity: s.spaceComplexity,
      improvementNotes: s.improvementNotes,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })) : [],
    blockers: "blockers" in problem && problem.blockers ? problem.blockers.map((b) => ({
      id: b.id,
      problemId: b.problemId,
      stuckPoint: b.stuckPoint,
      approachesTried: b.approachesTried,
      conceptsToLearn: b.conceptsToLearn,
      failureReason: b.failureReason,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    })) : [],
    attempts: "attempts" in problem && problem.attempts ? problem.attempts.map((a) => ({
      id: a.id,
      problemId: a.problemId,
      revisionId: a.revisionId || undefined,
      cycleNumber: a.cycleNumber || undefined,
      duration: Math.round(a.durationSeconds / 60),
      durationSeconds: a.durationSeconds,
      timeSpent: Math.round(a.durationSeconds / 60),
      createdDate: a.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      createdAt: a.createdAt.toISOString(),
    })) : [],
    revisions: "revisions" in problem && problem.revisions ? problem.revisions.map((r) => ({
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
    query: Partial<ListProblemsQuery> = {},
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
    // Calculate duration in seconds
    let durationSeconds: number | null = null
    if (input.timeSpentSeconds !== undefined && input.timeSpentSeconds !== null) {
      durationSeconds = input.timeSpentSeconds
    } else if (input.initialSolveDurationSeconds !== undefined && input.initialSolveDurationSeconds !== null) {
      durationSeconds = input.initialSolveDurationSeconds
    } else if (input.time !== undefined && input.time !== null) {
      durationSeconds = Math.round(input.time * 60)
    }

    const solvingStatus = input.solvingStatus || ProblemSolvingStatus.SOLVED
    const isSolved = solvingStatus === ProblemSolvingStatus.SOLVED

    // For NOT_SOLVED, initialSolveDurationSeconds and originalSolvedAt are null.
    // For SOLVED, originalSolvedAt is strictly generated server-side.
    const initialSolveDuration = isSolved ? durationSeconds : null
    const originalSolvedAt = isSolved ? new Date() : null

    // For SOLVED, include solutions; for NOT_SOLVED, include blockers
    const solutions = isSolved
      ? (input.solutions || (input.solution ? [input.solution] : []))
      : []
    const blockers = !isSolved
      ? (input.blockers || (input.blocker ? [input.blocker] : []))
      : []

    // Resolve or create topic tag records
    const topicIds = await problemRepository.resolveOrCreateTopics(userId, input.topics)

    const created = await problemRepository.create(
      userId,
      {
        title: input.title,
        url: input.url,
        platform: input.platform,
        difficulty: input.difficulty,
        solvingStatus,
        status: input.status,
        isMastered: input.isMastered,
        timeSpentSeconds: durationSeconds,
        approach: input.approach,
        timeComplexity: input.timeComplexity,
        spaceComplexity: input.spaceComplexity,
        notes: input.notes,
        mistakes: input.mistakes,
        initialSolveDurationSeconds: initialSolveDuration,
        originalSolvedAt,
        solutions,
        blockers,
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
    if (input.timeSpentSeconds !== undefined) {
      durationSeconds = input.timeSpentSeconds
    } else if (input.initialSolveDurationSeconds !== undefined) {
      durationSeconds = input.initialSolveDurationSeconds
    } else if (input.time !== undefined) {
      durationSeconds = Math.round(input.time * 60)
    }

    // If transitioning from NOT_SOLVED to SOLVED, assign server-side timestamp
    let originalSolvedAt: Date | null | undefined = undefined
    if (input.solvingStatus === ProblemSolvingStatus.SOLVED) {
      if (existing.solvingStatus === ProblemSolvingStatus.NOT_SOLVED || !existing.originalSolvedAt) {
        originalSolvedAt = new Date()
      } else {
        originalSolvedAt = existing.originalSolvedAt
      }
    } else if (input.solvingStatus === ProblemSolvingStatus.NOT_SOLVED) {
      originalSolvedAt = null
    }

    // Normalize solutions from array or singular
    const solutions = input.solutions || (input.solution ? [input.solution] : undefined)
    // Normalize blockers from array or singular
    const blockers = input.blockers || (input.blocker ? [input.blocker] : undefined)

    const updated = await problemRepository.update(
      id,
      userId,
      {
        title: input.title,
        url: input.url,
        platform: input.platform,
        difficulty: input.difficulty,
        solvingStatus: input.solvingStatus,
        status: input.status,
        isMastered: input.isMastered,
        timeSpentSeconds: durationSeconds,
        approach: input.approach,
        timeComplexity: input.timeComplexity,
        spaceComplexity: input.spaceComplexity,
        notes: input.notes,
        mistakes: input.mistakes,
        initialSolveDurationSeconds: input.solvingStatus === ProblemSolvingStatus.NOT_SOLVED ? null : durationSeconds,
        originalSolvedAt,
        solutions,
        blockers,
      },
      topicIds,
    )

    if (!updated) {
      throw new NotFoundError("Problem", id)
    }

    return formatProblemDto(updated)
  }

  /**
   * Adds an independent solution to a user-owned problem without overwriting existing solutions.
   */
  async addSolution(problemId: string, userId: string, solution: ProblemSolutionInput) {
    const existing = await problemRepository.findById(problemId, userId)
    if (!existing) {
      throw new NotFoundError("Problem", problemId)
    }

    const created = await problemRepository.addSolution(problemId, userId, solution)

    // If problem was unsolved, promote it to SOLVED with server timestamp
    if (existing.solvingStatus === ProblemSolvingStatus.NOT_SOLVED) {
      await problemRepository.update(problemId, userId, {
        solvingStatus: ProblemSolvingStatus.SOLVED,
        originalSolvedAt: new Date(),
      })
    }

    return created
  }

  /**
   * Adds learning/blocker information to an unsolved user-owned problem.
   */
  async addBlocker(problemId: string, userId: string, blocker: ProblemBlockerInput) {
    const existing = await problemRepository.findById(problemId, userId)
    if (!existing) {
      throw new NotFoundError("Problem", problemId)
    }

    const created = await problemRepository.addBlocker(problemId, userId, blocker)
    return created
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

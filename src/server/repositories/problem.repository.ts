import "server-only"
import { Difficulty, Platform, Prisma, ProblemSolvingStatus, ProblemStatus, SolutionType } from "@prisma/client"
import { BaseRepository } from "./base.repository"
import type { ListProblemsQuery } from "../validators/problem.schema"
import type { PaginationMeta } from "@/types/api"

export interface ProblemWithRelations extends Prisma.ProblemGetPayload<{
  include: {
    topics: {
      include: {
        topic: true
      }
    }
    solutions: true
    blockers: true
    revisions: true
    attempts: true
    assessments: true
  }
}> {}

export interface ProblemSummaryWithRelations extends Prisma.ProblemGetPayload<{
  include: {
    topics: {
      include: {
        topic: true
      }
    }
    solutions: true
    blockers: true
    revisions: true
    attempts: true
  }
}> {}

export class ProblemRepository extends BaseRepository {
  /**
   * Retrieves a paginated list of user-owned problems with search and multi-criteria filters.
   */
  async findMany(
    userId: string,
    query: Partial<ListProblemsQuery> = {},
  ): Promise<{ items: ProblemSummaryWithRelations[]; meta: PaginationMeta }> {
    const {
      page = 1,
      limit = 10,
      search,
      difficulty,
      platform,
      topic,
      status,
      solvingStatus,
      isMastered,
      archived,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query

    // Base where clause strictly isolated by userId
    const where: Prisma.ProblemWhereInput = {
      userId,
    }

    // Status filter
    if (status) {
      where.status = status
    }

    // Solving status filter (SOLVED / NOT_SOLVED)
    if (solvingStatus) {
      where.solvingStatus = solvingStatus
    }

    // Mastery filter
    if (isMastered !== undefined) {
      where.isMastered = isMastered
    }

    // Archived filter
    if (archived === true) {
      where.archivedAt = { not: null }
    } else if (archived === false) {
      where.archivedAt = null
    }

    // Difficulty filter
    if (difficulty) {
      where.difficulty = difficulty
    }

    // Platform filter
    if (platform) {
      where.platform = platform
    }

    // Topic filter (via join table relation)
    if (topic) {
      where.topics = {
        some: {
          topic: {
            name: {
              equals: topic,
              mode: "insensitive",
            },
          },
        },
      }
    }

    // Search query (title, notes, approach, or topic name)
    if (search && search.trim() !== "") {
      const q = search.trim()
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { approach: { contains: q, mode: "insensitive" } },
        { notes: { contains: q, mode: "insensitive" } },
        {
          topics: {
            some: {
              topic: {
                name: { contains: q, mode: "insensitive" },
              },
            },
          },
        },
      ]
    }

    // Sorting
    const allowedSortFields: Record<string, string> = {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      title: "title",
      difficulty: "difficulty",
      platform: "platform",
      status: "status",
      originalSolvedAt: "originalSolvedAt",
    }
    const orderByField = allowedSortFields[sortBy] || "createdAt"
    const orderBy: Prisma.ProblemOrderByWithRelationInput = {
      [orderByField]: sortOrder,
    }

    const skip = this.calculateSkip(page, limit)

    // Execute count and query in parallel for performance
    const [total, items] = await Promise.all([
      this.db.problem.count({ where }),
      this.db.problem.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          topics: {
            include: {
              topic: true,
            },
          },
          solutions: {
            orderBy: { createdAt: "asc" },
          },
          blockers: {
            orderBy: { createdAt: "desc" },
          },
          revisions: {
            orderBy: { scheduledAt: "desc" },
          },
          attempts: {
            orderBy: { createdAt: "desc" },
          },
        },
      }),
    ])

    const meta = this.calculatePagination(total, page, limit)

    return { items, meta }
  }

  /**
   * Retrieves a single problem by ID, strictly enforcing user ownership.
   * Returns null if not found or belongs to another user.
   */
  async findById(
    id: string,
    userId: string,
  ): Promise<ProblemWithRelations | null> {
    return this.db.problem.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        topics: {
          include: {
            topic: true,
          },
        },
        solutions: {
          orderBy: { createdAt: "asc" },
        },
        blockers: {
          orderBy: { createdAt: "desc" },
        },
        revisions: {
          orderBy: { scheduledAt: "desc" },
        },
        attempts: {
          orderBy: { createdAt: "desc" },
        },
        assessments: {
          orderBy: { createdAt: "desc" },
        },
      },
    })
  }

  /**
   * Creates a problem with topic associations inside a Prisma transaction.
   */
  async create(
    userId: string,
    data: {
      title: string
      url: string
      platform: Platform
      difficulty: Difficulty
      solvingStatus?: ProblemSolvingStatus
      status?: ProblemStatus
      isMastered?: boolean
      masteredAt?: Date | null
      currentCycle?: number
      timeSpentSeconds?: number | null
      approach?: string | null
      timeComplexity?: string | null
      spaceComplexity?: string | null
      notes?: string | null
      mistakes?: string | null
      initialSolveDurationSeconds?: number | null
      originalSolvedAt?: Date | null
      solutions?: Array<{
        solutionType: SolutionType
        approach: string
        timeComplexity?: string | null
        spaceComplexity?: string | null
        improvementNotes?: string | null
      }>
      blockers?: Array<{
        stuckPoint?: string | null
        approachesTried?: string | null
        conceptsToLearn?: string | null
        failureReason?: string | null
      }>
    },
    topicIds: string[],
  ): Promise<ProblemWithRelations> {
    return this.db.$transaction(async (tx) => {
      const problem = await tx.problem.create({
        data: {
          userId,
          title: data.title,
          url: data.url,
          platform: data.platform,
          difficulty: data.difficulty,
          solvingStatus: data.solvingStatus || ProblemSolvingStatus.SOLVED,
          status: data.status || ProblemStatus.LEARNING,
          isMastered: data.isMastered || false,
          masteredAt: data.masteredAt,
          currentCycle: data.currentCycle || 1,
          timeSpentSeconds: data.timeSpentSeconds,
          approach: data.approach,
          timeComplexity: data.timeComplexity,
          spaceComplexity: data.spaceComplexity,
          notes: data.notes,
          mistakes: data.mistakes,
          initialSolveDurationSeconds: data.initialSolveDurationSeconds,
          originalSolvedAt: data.originalSolvedAt !== undefined ? data.originalSolvedAt : (data.solvingStatus === ProblemSolvingStatus.NOT_SOLVED ? null : new Date()),
          topics: {
            create: topicIds.map((topicId) => ({
              topic: {
                connect: { id: topicId },
              },
            })),
          },
          ...(data.solutions && data.solutions.length > 0 && {
            solutions: {
              create: data.solutions.map((sol) => ({
                solutionType: sol.solutionType,
                approach: sol.approach,
                timeComplexity: sol.timeComplexity,
                spaceComplexity: sol.spaceComplexity,
                improvementNotes: sol.improvementNotes,
              })),
            },
          }),
          ...(data.blockers && data.blockers.length > 0 && {
            blockers: {
              create: data.blockers.map((blk) => ({
                stuckPoint: blk.stuckPoint,
                approachesTried: blk.approachesTried,
                conceptsToLearn: blk.conceptsToLearn,
                failureReason: blk.failureReason,
              })),
            },
          }),
        },
        include: {
          topics: {
            include: {
              topic: true,
            },
          },
          solutions: {
            orderBy: { createdAt: "asc" },
          },
          blockers: {
            orderBy: { createdAt: "desc" },
          },
          revisions: true,
          attempts: true,
          assessments: true,
        },
      })

      return problem
    })
  }

  /**
   * Updates an existing user-owned problem and optionally refreshes its topic links.
   */
  async update(
    id: string,
    userId: string,
    data: {
      title?: string
      url?: string
      platform?: Platform
      difficulty?: Difficulty
      solvingStatus?: ProblemSolvingStatus
      status?: ProblemStatus
      isMastered?: boolean
      masteredAt?: Date | null
      currentCycle?: number
      timeSpentSeconds?: number | null
      approach?: string | null
      timeComplexity?: string | null
      spaceComplexity?: string | null
      notes?: string | null
      mistakes?: string | null
      initialSolveDurationSeconds?: number | null
      originalSolvedAt?: Date | null
      solutions?: Array<{
        solutionType: SolutionType
        approach: string
        timeComplexity?: string | null
        spaceComplexity?: string | null
        improvementNotes?: string | null
      }>
      blockers?: Array<{
        stuckPoint?: string | null
        approachesTried?: string | null
        conceptsToLearn?: string | null
        failureReason?: string | null
      }>
    },
    topicIds?: string[],
  ): Promise<ProblemWithRelations | null> {
    // First verify user ownership
    const existing = await this.db.problem.findFirst({
      where: { id, userId },
      select: { id: true },
    })

    if (!existing) {
      return null
    }

    return this.db.$transaction(async (tx) => {
      // If new topicIds were provided, replace topic associations
      if (topicIds !== undefined) {
        await tx.problemTopic.deleteMany({
          where: { problemId: id },
        })

        if (topicIds.length > 0) {
          await tx.problemTopic.createMany({
            data: topicIds.map((topicId) => ({
              problemId: id,
              topicId,
            })),
          })
        }
      }

      // If new solutions were provided, create them
      if (data.solutions && data.solutions.length > 0) {
        await tx.problemSolution.createMany({
          data: data.solutions.map((sol) => ({
            problemId: id,
            solutionType: sol.solutionType,
            approach: sol.approach,
            timeComplexity: sol.timeComplexity,
            spaceComplexity: sol.spaceComplexity,
            improvementNotes: sol.improvementNotes,
          })),
        })
      }

      // If new blockers were provided, create them
      if (data.blockers && data.blockers.length > 0) {
        await tx.problemBlocker.createMany({
          data: data.blockers.map((blk) => ({
            problemId: id,
            stuckPoint: blk.stuckPoint,
            approachesTried: blk.approachesTried,
            conceptsToLearn: blk.conceptsToLearn,
            failureReason: blk.failureReason,
          })),
        })
      }

      const updated = await tx.problem.update({
        where: { id },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.url !== undefined && { url: data.url }),
          ...(data.platform !== undefined && { platform: data.platform }),
          ...(data.difficulty !== undefined && { difficulty: data.difficulty }),
          ...(data.solvingStatus !== undefined && { solvingStatus: data.solvingStatus }),
          ...(data.status !== undefined && { status: data.status }),
          ...(data.isMastered !== undefined && { isMastered: data.isMastered }),
          ...(data.masteredAt !== undefined && { masteredAt: data.masteredAt }),
          ...(data.currentCycle !== undefined && { currentCycle: data.currentCycle }),
          ...(data.timeSpentSeconds !== undefined && { timeSpentSeconds: data.timeSpentSeconds }),
          ...(data.approach !== undefined && { approach: data.approach }),
          ...(data.timeComplexity !== undefined && { timeComplexity: data.timeComplexity }),
          ...(data.spaceComplexity !== undefined && { spaceComplexity: data.spaceComplexity }),
          ...(data.notes !== undefined && { notes: data.notes }),
          ...(data.mistakes !== undefined && { mistakes: data.mistakes }),
          ...(data.initialSolveDurationSeconds !== undefined && {
            initialSolveDurationSeconds: data.initialSolveDurationSeconds,
          }),
          ...(data.originalSolvedAt !== undefined && { originalSolvedAt: data.originalSolvedAt }),
        },
        include: {
          topics: {
            include: {
              topic: true,
            },
          },
          solutions: {
            orderBy: { createdAt: "asc" },
          },
          blockers: {
            orderBy: { createdAt: "desc" },
          },
          revisions: {
            orderBy: { scheduledAt: "desc" },
          },
          attempts: {
            orderBy: { createdAt: "desc" },
          },
          assessments: {
            orderBy: { createdAt: "desc" },
          },
        },
      })

      return updated
    })
  }

  /**
   * Sets archivedAt timestamp and updates status to ARCHIVED.
   */
  async archive(id: string, userId: string): Promise<ProblemWithRelations | null> {
    const existing = await this.db.problem.findFirst({
      where: { id, userId },
      select: { id: true },
    })

    if (!existing) {
      return null
    }

    return this.db.problem.update({
      where: { id },
      data: {
        archivedAt: new Date(),
        status: ProblemStatus.ARCHIVED,
      },
      include: {
        topics: {
          include: {
            topic: true,
          },
        },
        solutions: {
          orderBy: { createdAt: "asc" },
        },
        blockers: {
          orderBy: { createdAt: "desc" },
        },
        revisions: true,
        attempts: true,
        assessments: true,
      },
    })
  }

  /**
   * Clears archivedAt timestamp and restores status to LEARNING.
   */
  async restore(id: string, userId: string): Promise<ProblemWithRelations | null> {
    const existing = await this.db.problem.findFirst({
      where: { id, userId },
      select: { id: true },
    })

    if (!existing) {
      return null
    }

    return this.db.problem.update({
      where: { id },
      data: {
        archivedAt: null,
        status: ProblemStatus.LEARNING,
      },
      include: {
        topics: {
          include: {
            topic: true,
          },
        },
        solutions: {
          orderBy: { createdAt: "asc" },
        },
        blockers: {
          orderBy: { createdAt: "desc" },
        },
        revisions: true,
        attempts: true,
        assessments: true,
      },
    })
  }

  /**
   * Adds an independent solution (BRUTE_FORCE or OPTIMIZED) to a user-owned problem.
   * Adding an optimized solution does not overwrite or delete existing brute-force solutions.
   */
  async addSolution(
    problemId: string,
    userId: string,
    data: {
      solutionType: SolutionType
      approach: string
      timeComplexity?: string | null
      spaceComplexity?: string | null
      improvementNotes?: string | null
    },
  ) {
    const existing = await this.db.problem.findFirst({
      where: { id: problemId, userId },
      select: { id: true },
    })

    if (!existing) {
      return null
    }

    return this.db.problemSolution.create({
      data: {
        problemId,
        solutionType: data.solutionType,
        approach: data.approach,
        timeComplexity: data.timeComplexity,
        spaceComplexity: data.spaceComplexity,
        improvementNotes: data.improvementNotes,
      },
    })
  }

  /**
   * Adds learning/blocker information to an unsolved user-owned problem.
   */
  async addBlocker(
    problemId: string,
    userId: string,
    data: {
      stuckPoint?: string | null
      approachesTried?: string | null
      conceptsToLearn?: string | null
      failureReason?: string | null
    },
  ) {
    const existing = await this.db.problem.findFirst({
      where: { id: problemId, userId },
      select: { id: true },
    })

    if (!existing) {
      return null
    }

    return this.db.problemBlocker.create({
      data: {
        problemId,
        stuckPoint: data.stuckPoint,
        approachesTried: data.approachesTried,
        conceptsToLearn: data.conceptsToLearn,
        failureReason: data.failureReason,
      },
    })
  }

  /**
   * Manually marks a problem as mastered independently of revision completion.
   */
  async markMastered(id: string, userId: string): Promise<ProblemWithRelations | null> {
    const existing = await this.db.problem.findFirst({
      where: { id, userId },
      select: { id: true },
    })

    if (!existing) {
      return null
    }

    return this.db.problem.update({
      where: { id },
      data: {
        isMastered: true,
        masteredAt: new Date(),
        status: ProblemStatus.MASTERED,
      },
      include: {
        topics: {
          include: {
            topic: true,
          },
        },
        solutions: {
          orderBy: { createdAt: "asc" },
        },
        blockers: {
          orderBy: { createdAt: "desc" },
        },
        revisions: true,
        attempts: true,
        assessments: true,
      },
    })
  }

  /**
   * Unmarks mastery, supporting later creation of fresh revision cycles without destroying historical data.
   */
  async unmarkMastered(id: string, userId: string): Promise<ProblemWithRelations | null> {
    const existing = await this.db.problem.findFirst({
      where: { id, userId },
      select: { id: true },
    })

    if (!existing) {
      return null
    }

    return this.db.problem.update({
      where: { id },
      data: {
        isMastered: false,
        masteredAt: null,
        status: ProblemStatus.LEARNING,
      },
      include: {
        topics: {
          include: {
            topic: true,
          },
        },
        solutions: {
          orderBy: { createdAt: "asc" },
        },
        blockers: {
          orderBy: { createdAt: "desc" },
        },
        revisions: true,
        attempts: true,
        assessments: true,
      },
    })
  }

  /**
   * Resolves or creates Topic records for a given list of topic tag names.
   * Handles user-custom topics under (userId, name) unique constraint or global topics (userId = null).
   */
  async resolveOrCreateTopics(userId: string, topicNames: string[]): Promise<string[]> {
    const trimmedNames = Array.from(
      new Set(topicNames.map((t) => t.trim()).filter((t) => t.length > 0)),
    )

    if (trimmedNames.length === 0) {
      return []
    }

    const topicIds: string[] = []

    for (const name of trimmedNames) {
      // Check if topic exists for this user or globally
      const existing = await this.db.topic.findFirst({
        where: {
          name: { equals: name, mode: "insensitive" },
          OR: [{ userId }, { userId: null }],
        },
      })

      if (existing) {
        topicIds.push(existing.id)
      } else {
        // Create custom topic for this user
        const created = await this.db.topic.create({
          data: {
            name,
            userId,
          },
        })
        topicIds.push(created.id)
      }
    }

    return topicIds
  }
}

export const problemRepository = new ProblemRepository()

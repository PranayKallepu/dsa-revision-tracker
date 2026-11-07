import "server-only"
import { Difficulty, Platform, Prisma, ProblemStatus } from "@prisma/client"
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
    query: ListProblemsQuery,
  ): Promise<{ items: ProblemSummaryWithRelations[]; meta: PaginationMeta }> {
    const {
      page = 1,
      limit = 10,
      search,
      difficulty,
      platform,
      topic,
      status,
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
      status?: ProblemStatus
      approach?: string | null
      timeComplexity?: string | null
      spaceComplexity?: string | null
      notes?: string | null
      mistakes?: string | null
      initialSolveDurationSeconds?: number | null
      originalSolvedAt?: Date
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
          status: data.status || ProblemStatus.LEARNING,
          approach: data.approach,
          timeComplexity: data.timeComplexity,
          spaceComplexity: data.spaceComplexity,
          notes: data.notes,
          mistakes: data.mistakes,
          initialSolveDurationSeconds: data.initialSolveDurationSeconds,
          originalSolvedAt: data.originalSolvedAt || new Date(),
          topics: {
            create: topicIds.map((topicId) => ({
              topic: {
                connect: { id: topicId },
              },
            })),
          },
        },
        include: {
          topics: {
            include: {
              topic: true,
            },
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
      status?: ProblemStatus
      approach?: string | null
      timeComplexity?: string | null
      spaceComplexity?: string | null
      notes?: string | null
      mistakes?: string | null
      initialSolveDurationSeconds?: number | null
      originalSolvedAt?: Date
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

      const updated = await tx.problem.update({
        where: { id },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.url !== undefined && { url: data.url }),
          ...(data.platform !== undefined && { platform: data.platform }),
          ...(data.difficulty !== undefined && { difficulty: data.difficulty }),
          ...(data.status !== undefined && { status: data.status }),
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


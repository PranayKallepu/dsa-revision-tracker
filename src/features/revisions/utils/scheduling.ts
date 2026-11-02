import type { Problem, ProblemStatus, RevisionRating } from "@/types"

/**
 * Spaced Repetition Schedule Curve (Days from original solve date):
 * Day 1, 3, 7, 15, 30, 60, 90, 120, and every 30 days thereafter.
 */
export const SCHEDULE_INTERVALS_DAYS = [1, 3, 7, 15, 30, 60, 90, 120] as const

/**
 * Returns the cumulative scheduled day offset from the original solve date
 * for a given revision interval (1-based index).
 */
export function getDaysOffsetForRevision(revisionNumber: number): number {
  if (revisionNumber <= 0) return 1
  if (revisionNumber <= SCHEDULE_INTERVALS_DAYS.length) {
    return SCHEDULE_INTERVALS_DAYS[revisionNumber - 1]
  }
  // For intervals beyond 120: Day 120 + 30 days for each subsequent revision
  const extraRevisions = revisionNumber - SCHEDULE_INTERVALS_DAYS.length
  return 120 + extraRevisions * 30
}

export interface NextRevisionSchedule {
  nextRevisionNumber: number
  nextRevisionDateText: string
  nextStatus: ProblemStatus
  cycleRestarted: boolean
  scheduledDaysFromSolve: number
  targetDateISO?: string
}

/**
 * Calculates the next revision parameters based on the platform's spaced repetition rules:
 *
 * 1. Completing a revision does not reset the original solve schedule baseline.
 * 2. Late completion preserves the future schedule (does not push all future dates forward).
 * 3. Never automatically skips missed revisions.
 * 4. "Forgot" or "Difficult" restarts the revision cycle:
 *    - The next Day 1 revision is due TOMORROW.
 *    - Cycle restarts while preserving all past attempt and revision history.
 * 5. "Good" or "Easy" advances to the next interval on the curve.
 * 6. Never mutates the original solve/creation date.
 */
export function calculateNextRevision(
  problem: Problem,
  rating: RevisionRating,
  completionDate: Date = new Date(),
): NextRevisionSchedule {
  const isRestart = rating === "Forgot" || rating === "Difficult"

  if (isRestart) {
    // Rule: Forgot or Difficult restarts the revision cycle; Day 1 is due tomorrow
    const tomorrow = new Date(completionDate)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return {
      nextRevisionNumber: 1,
      nextRevisionDateText: "Tomorrow",
      nextStatus: "Learning",
      cycleRestarted: true,
      scheduledDaysFromSolve: 1,
      targetDateISO: tomorrow.toISOString(),
    }
  }

  // Rule: Good or Easy continues the existing schedule
  const nextRevisionNumber = (problem.revision || 0) + 1
  const scheduledDaysFromSolve = getDaysOffsetForRevision(nextRevisionNumber)

  // Determine base date
  const baseDate = problem.originalSolveDate || problem.createdAt
    ? new Date(problem.originalSolveDate || problem.createdAt!)
    : new Date(completionDate.getTime() - (getDaysOffsetForRevision(problem.revision || 1) * 24 * 60 * 60 * 1000))

  const targetDate = new Date(baseDate)
  targetDate.setDate(targetDate.getDate() + scheduledDaysFromSolve)

  // Compare targetDate with completionDate to handle late completions
  const diffDays = Math.ceil(
    (targetDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24),
  )

  let nextRevisionDateText: string
  if (diffDays <= 0) {
    // If future schedule date is already past due or today, schedule for Tomorrow without skipping
    nextRevisionDateText = "Tomorrow"
  } else if (diffDays === 1) {
    nextRevisionDateText = "Tomorrow"
  } else if (diffDays < 7) {
    nextRevisionDateText = `In ${diffDays} days`
  } else {
    // Format Month Day (e.g., "Jun 15")
    nextRevisionDateText = targetDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  // Mastered rule: If user achieves high revision (>= 5) and rates Easy, status becomes Mastered
  const isMastered =
    nextRevisionNumber >= 6 && (rating === "Easy" || problem.status === "Mastered")

  return {
    nextRevisionNumber,
    nextRevisionDateText,
    nextStatus: isMastered ? "Mastered" : "Learning",
    cycleRestarted: false,
    scheduledDaysFromSolve,
    targetDateISO: targetDate.toISOString(),
  }
}


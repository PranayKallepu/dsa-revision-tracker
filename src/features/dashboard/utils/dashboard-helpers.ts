import type { Problem } from "@/types/problem"
import type { DashboardMetrics, OverdueProblemItem } from "../types"
import { defaultOverdueDaysMap } from "../data/dashboard-data"

/**
 * Computes dashboard statistics conforming to business rules:
 * - Archived problems must NOT count as active problems.
 * - Mastered problems must only count if status is 'Mastered'.
 * - Overdue and Due Today are counted distinctly without duplicate overlaps.
 */
export function calculateDashboardStats(problems: Problem[]): DashboardMetrics {
  const activeProblems = problems.filter((p) => p.status !== "Archived")
  const totalActive = activeProblems.length

  // Due today: active problems scheduled for Today that are not overdue
  const dueTodayProblems = activeProblems.filter(
    (p) =>
      p.status !== "Overdue" &&
      p.status !== "Mastered" &&
      p.nextRevision.toLowerCase() === "today",
  )

  // Overdue problems
  const overdueProblems = activeProblems.filter((p) => p.status === "Overdue")

  // Mastered problems
  const masteredProblems = activeProblems.filter(
    (p) => p.status === "Mastered",
  )

  const masteredPct =
    totalActive > 0 ? Math.round((masteredProblems.length / totalActive) * 100) : 0

  return {
    totalActive,
    totalActiveNote: "+12 this month",
    dueToday: dueTodayProblems.length,
    dueTodayNote: `About ${Math.max(1, dueTodayProblems.length * 20)}m estimated`,
    overdue: overdueProblems.length,
    overdueNote:
      overdueProblems.length > 0
        ? "Oldest is 3 days late"
        : "All revisions caught up",
    mastered: masteredProblems.length,
    masteredNote: `${masteredPct}% of your active library`,
  }
}

/**
 * Returns active problems scheduled for today's revision queue.
 */
export function getDueTodayProblems(problems: Problem[]): Problem[] {
  return problems.filter(
    (p) =>
      p.status !== "Archived" &&
      p.status !== "Overdue" &&
      p.status !== "Mastered" &&
      p.nextRevision.toLowerCase() === "today",
  )
}

/**
 * Returns overdue problems with days overdue calculation.
 * Ensures overdue revisions are distinct from upcoming revisions.
 */
export function getOverdueProblems(problems: Problem[]): OverdueProblemItem[] {
  return problems
    .filter((p) => p.status !== "Archived" && p.status === "Overdue")
    .map((p) => ({
      problem: p,
      daysOverdue: defaultOverdueDaysMap[p.id] ?? 2,
    }))
}

/**
 * Returns upcoming problems scheduled for future dates.
 * Strictly separates upcoming items from overdue items and due today items.
 */
export function getUpcomingProblems(problems: Problem[]): Problem[] {
  return problems.filter(
    (p) =>
      p.status !== "Archived" &&
      p.status !== "Overdue" &&
      p.nextRevision !== "—" &&
      p.nextRevision.toLowerCase() !== "today",
  )
}

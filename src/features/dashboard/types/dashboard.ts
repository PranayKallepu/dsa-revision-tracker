import type { Problem } from "@/types/problem"
import type { ActivityItem, UpcomingDay } from "@/types/activity"

export interface DashboardMetrics {
  totalActive: number
  totalActiveNote: string
  dueToday: number
  dueTodayNote: string
  overdue: number
  overdueNote: string
  mastered: number
  masteredNote: string
}

export type DashboardStatsMetrics = DashboardMetrics

export interface OverdueProblemItem {
  problem: Problem
  daysOverdue: number
}

export interface RevisionOverviewStats {
  completedThisWeek: number
  totalThisWeek: number
  weeklyPercentage: number
  daysOutlook: UpcomingDay[]
}

export interface TopicMomentumItem {
  topic: string
  percentage: number
}

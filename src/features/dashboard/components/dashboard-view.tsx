"use client"

import { useProblems } from "@/hooks/use-problems"
import type { Screen } from "@/types/navigation"
import { DashboardHeader } from "./dashboard-header"
import { DashboardStats } from "./dashboard-stats"
import { DueTodaySection } from "./due-today-section"
import { OverdueSection } from "./overdue-section"
import { RecentActivitySection } from "./recent-activity-section"
import { RevisionOverview } from "./revision-overview"
import { TopicMomentumCard } from "./topic-momentum-card"
import { UpcomingSection } from "./upcoming-section"
import {
  calculateDashboardStats,
  getDueTodayProblems,
  getOverdueProblems,
  getUpcomingProblems,
} from "../utils"

export interface DashboardViewProps {
  setScreen?: (s: Screen) => void
}

export function DashboardView({ setScreen }: DashboardViewProps) {
  const { items } = useProblems()

  // Calculate stats following business rules (active excludes archived, mastered requires status)
  const stats = calculateDashboardStats(items)
  const overdueItems = getOverdueProblems(items)
  const dueTodayItems = getDueTodayProblems(items)
  const upcomingItems = getUpcomingProblems(items)

  return (
    <div className="space-y-6">
      {/* 1. Dashboard Header */}
      <DashboardHeader />

      {/* 2. Key Metrics Stats Cards */}
      <DashboardStats stats={stats} />

      {/* 3. Overdue Revisions Section (Prominently displayed if any overdue items exist) */}
      <OverdueSection overdueItems={overdueItems} />

      {/* 4. Due Today Queue + 7-Day Revision Outlook */}
      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <DueTodaySection problems={dueTodayItems} />
        <RevisionOverview />
      </div>

      {/* 5. Upcoming Schedule + Topic Mastery Momentum */}
      <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
        <UpcomingSection problems={upcomingItems} />
        <TopicMomentumCard />
      </div>

      {/* 6. Recent Activity Log */}
      <RecentActivitySection />
    </div>
  )
}

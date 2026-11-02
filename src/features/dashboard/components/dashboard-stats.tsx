import { CalendarDays, Clock3, Layers3, Trophy } from "lucide-react"
import { StatCard } from "@/components/shared/stat-card"
import type { DashboardMetrics } from "../types"

export interface DashboardStatsProps {
  stats: DashboardMetrics
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total active problems"
        value={String(stats.totalActive)}
        note={stats.totalActiveNote}
        icon={Layers3}
        tone="primary"
      />
      <StatCard
        label="Due today"
        value={String(stats.dueToday)}
        note={stats.dueTodayNote}
        icon={CalendarDays}
        tone="warning"
      />
      <StatCard
        label="Overdue revisions"
        value={String(stats.overdue)}
        note={stats.overdueNote}
        icon={Clock3}
        tone="danger"
      />
      <StatCard
        label="Mastered problems"
        value={String(stats.mastered)}
        note={stats.masteredNote}
        icon={Trophy}
        tone="success"
      />
    </div>
  )
}

"use client"

import { useRouter } from "next/navigation"
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Layers3,
  Trophy,
} from "lucide-react"
import { Badge, Button, Card, Progress } from "@/components/ui"
import { DifficultyBadge } from "@/components/shared/difficulty-badge"
import { StatCard } from "@/components/shared/stat-card"
import { activities, problems as seedProblems, upcoming } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import type { Screen } from "@/types/navigation"

export interface DashboardViewProps {
  setScreen?: (s: Screen) => void
}

export function DashboardView({ setScreen }: DashboardViewProps) {
  const router = useRouter()

  const navigate = (path: string, screenFallback?: Screen) => {
    if (setScreen && screenFallback) {
      setScreen(screenFallback)
    } else {
      router.push(path)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total problems"
          value="148"
          note="+12 this month"
          icon={Layers3}
        />
        <StatCard
          label="Due today"
          value="5"
          note="About 1h 45m"
          icon={CalendarDays}
          tone="warning"
        />
        <StatCard
          label="Overdue"
          value="2"
          note="Oldest is 3 days late"
          icon={Clock3}
          tone="danger"
        />
        <StatCard
          label="Mastered"
          value="46"
          note="31% of your library"
          icon={Trophy}
          tone="success"
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <div className="font-bold">Today’s revision queue</div>
              <div className="text-sm text-muted-foreground">
                Prioritized by urgency and difficulty
              </div>
            </div>
            <Button
              variant="soft"
              size="sm"
              onClick={() => navigate("/revisions", "revision")}
            >
              Start revision <ArrowRight className="size-4" />
            </Button>
          </div>
          <div className="divide-y">
            {seedProblems.slice(0, 4).map((p, i) => (
              <button
                key={p.id}
                className="flex w-full items-center gap-4 p-4 text-left hover:bg-muted/60"
                onClick={() => navigate(`/problems/${p.id}`, "details")}
              >
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                    i === 0
                      ? "bg-red-50 text-danger"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">
                    {p.title}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{p.platform}</span>
                    <span>•</span>
                    <span>Revision {p.revision}</span>
                  </div>
                </div>
                <DifficultyBadge value={p.difficulty} />
                <ArrowRight className="hidden size-4 text-muted-foreground sm:block" />
              </button>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold">Revision outlook</div>
              <div className="text-sm text-muted-foreground">Next 7 days</div>
            </div>
            <Badge tone="primary">23 total</Badge>
          </div>
          <div className="mt-6 grid grid-cols-7 gap-2">
            {upcoming.map((d) => (
              <div
                key={d.date}
                className={cn(
                  "rounded-xl py-3 text-center",
                  d.active
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-muted",
                )}
              >
                <div
                  className={cn(
                    "text-[10px] font-semibold uppercase",
                    !d.active && "text-muted-foreground",
                  )}
                >
                  {d.day}
                </div>
                <div className="my-1 text-lg font-bold">{d.date}</div>
                <div
                  className={cn(
                    "text-[10px]",
                    !d.active && "text-muted-foreground",
                  )}
                >
                  {d.count} due
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-muted/70 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">Weekly completion</span>
              <span className="font-bold text-primary">78%</span>
            </div>
            <Progress className="mt-3" value={78} />
            <div className="mt-2 text-xs text-muted-foreground">
              18 of 23 revisions completed
            </div>
          </div>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.45fr]">
        <Card className="p-5">
          <div className="font-bold">Topic momentum</div>
          <div className="mt-5 space-y-4">
            {[
              ["Arrays & Hashing", 86],
              ["Graphs", 68],
              ["Dynamic Programming", 54],
              ["Trees", 74],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground">{value}%</span>
                </div>
                <Progress value={value as number} />
              </div>
            ))}
          </div>
          <Button
            className="mt-5 w-full"
            variant="outline"
            onClick={() => navigate("/analytics", "analytics")}
          >
            View full analytics
          </Button>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="font-bold">Recent activity</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/activity", "activity")}
            >
              View all
            </Button>
          </div>
          <div className="mt-3 divide-y">
            {activities.slice(0, 4).map((a) => (
              <div key={a.problem} className="flex gap-3 py-3">
                <div className="mt-1 size-2 rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm">
                    <span className="font-semibold">{a.action}</span> ·{" "}
                    {a.problem}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {a.detail}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {a.time.split(",")[0]}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

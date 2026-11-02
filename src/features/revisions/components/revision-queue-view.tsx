"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react"
import { Badge, Button, Card } from "@/components/ui"
import { DifficultyBadge } from "@/components/shared/difficulty-badge"
import { useProblems } from "@/hooks/use-problems"
import { getDueTodayProblems, getOverdueProblems, getUpcomingProblems } from "@/features/dashboard/utils"

export function RevisionQueueView() {
  const router = useRouter()
  const { items } = useProblems()

  const [activeTab, setActiveTab] = useState<"due" | "overdue" | "upcoming">("due")

  const dueTodayProblems = useMemo(() => getDueTodayProblems(items), [items])
  const overdueItems = useMemo(() => getOverdueProblems(items), [items])
  const upcomingProblems = useMemo(() => getUpcomingProblems(items), [items])

  const totalActionable = dueTodayProblems.length + overdueItems.length

  const handleStartQueue = () => {
    // Prioritize overdue, then due today
    if (overdueItems.length > 0) {
      router.push(`/revisions/${overdueItems[0].problem.id}`)
    } else if (dueTodayProblems.length > 0) {
      router.push(`/revisions/${dueTodayProblems[0].id}`)
    } else if (items.length > 0) {
      router.push(`/revisions/${items[0].id}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Revision Queue
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Recall first. Reveal second. Rate honestly. Spaced repetition keeps solutions sticky.
          </p>
        </div>

        {totalActionable > 0 && (
          <Button size="lg" onClick={handleStartQueue} className="gap-2">
            <Play className="size-4 fill-current" />
            <span>Start Revision Session</span>
          </Button>
        )}
      </div>

      {/* 2. Quick Counts Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setActiveTab("due")}
          className="text-left"
        >
          <Card
            className={`p-5 transition-all cursor-pointer ${
              activeTab === "due"
                ? "border-primary bg-secondary/30 ring-2 ring-primary/20"
                : "hover:bg-muted/30"
            }`}
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Due Today</span>
              <Calendar className="size-4 text-primary" />
            </div>
            <div className="mt-2 text-3xl font-extrabold text-foreground">
              {dueTodayProblems.length}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Scheduled for today's review
            </div>
          </Card>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("overdue")}
          className="text-left"
        >
          <Card
            className={`p-5 transition-all cursor-pointer ${
              activeTab === "overdue"
                ? "border-destructive bg-destructive/5 ring-2 ring-destructive/20"
                : "hover:bg-muted/30"
            }`}
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Overdue</span>
              <AlertTriangle className="size-4 text-destructive" />
            </div>
            <div className="mt-2 text-3xl font-extrabold text-foreground">
              {overdueItems.length}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Prioritize to prevent forgetting
            </div>
          </Card>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("upcoming")}
          className="text-left"
        >
          <Card
            className={`p-5 transition-all cursor-pointer ${
              activeTab === "upcoming"
                ? "border-primary bg-secondary/30 ring-2 ring-primary/20"
                : "hover:bg-muted/30"
            }`}
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Upcoming</span>
              <Clock className="size-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-3xl font-extrabold text-foreground">
              {upcomingProblems.length}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Scheduled on future dates
            </div>
          </Card>
        </button>
      </div>

      {/* 3. Tab Contents */}
      {activeTab === "due" && (
        <Card className="overflow-hidden">
          <div className="border-b p-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-foreground">Due Today's Queue</h2>
              <p className="text-xs text-muted-foreground">
                Active problems scheduled for today's spaced recall.
              </p>
            </div>
            <Badge tone="primary">{dueTodayProblems.length} due</Badge>
          </div>

          {dueTodayProblems.length > 0 ? (
            <div className="divide-y">
              {dueTodayProblems.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/problems/${p.id}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {p.title}
                      </Link>
                      <DifficultyBadge value={p.difficulty} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{p.platform}</span>
                      <span>·</span>
                      <span>Interval #{p.revision ?? 1}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        ~{p.time || 25} min
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/problems/${p.id}`}>Details</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/revisions/${p.id}`}>
                        Revise Now
                        <ArrowRight className="size-3.5 ml-1.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              <CalendarCheck className="size-12 mx-auto stroke-1 text-success mb-3" />
              <h3 className="font-semibold text-foreground">All caught up for today!</h3>
              <p className="text-xs max-w-sm mx-auto mt-1">
                You have completed all scheduled revisions for today. Check overdue items or add new problems to continue learning.
              </p>
            </div>
          )}
        </Card>
      )}

      {activeTab === "overdue" && (
        <Card className="overflow-hidden border-destructive/20">
          <div className="border-b border-destructive/10 bg-destructive/5 p-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-foreground">Overdue Revisions</h2>
              <p className="text-xs text-muted-foreground">
                Revisions past their scheduled date. They will remain pending until completed.
              </p>
            </div>
            <Badge tone="danger">{overdueItems.length} overdue</Badge>
          </div>

          {overdueItems.length > 0 ? (
            <div className="divide-y divide-destructive/10">
              {overdueItems.map(({ problem, daysOverdue }) => (
                <div
                  key={problem.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-destructive/5 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/problems/${problem.id}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {problem.title}
                      </Link>
                      <Badge tone="danger">{daysOverdue}d overdue</Badge>
                      <DifficultyBadge value={problem.difficulty} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{problem.platform}</span>
                      <span>·</span>
                      <span>Interval #{problem.revision ?? 1}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        ~{problem.time || 25} min
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/problems/${problem.id}`}>Details</Link>
                    </Button>
                    <Button variant="destructive" size="sm" asChild>
                      <Link href={`/revisions/${problem.id}`}>
                        Revise Overdue
                        <ArrowRight className="size-3.5 ml-1.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              <CheckCircle2 className="size-12 mx-auto stroke-1 text-success mb-3" />
              <h3 className="font-semibold text-foreground">No overdue revisions!</h3>
              <p className="text-xs max-w-sm mx-auto mt-1">
                You are on track with your spaced repetition curve.
              </p>
            </div>
          )}
        </Card>
      )}

      {activeTab === "upcoming" && (
        <Card className="overflow-hidden">
          <div className="border-b p-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-foreground">Upcoming Revisions</h2>
              <p className="text-xs text-muted-foreground">
                Scheduled for future review dates based on the spaced interval curve.
              </p>
            </div>
            <Badge tone="neutral">{upcomingProblems.length} upcoming</Badge>
          </div>

          {upcomingProblems.length > 0 ? (
            <div className="divide-y">
              {upcomingProblems.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/problems/${p.id}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {p.title}
                      </Link>
                      <Badge tone="neutral">Due: {p.nextRevision}</Badge>
                      <DifficultyBadge value={p.difficulty} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{p.platform}</span>
                      <span>·</span>
                      <span>Next: Interval #{p.revision ?? 1}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/problems/${p.id}`}>Details</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/revisions/${p.id}`}>
                        Early Review
                        <ArrowRight className="size-3.5 ml-1.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              <Clock className="size-12 mx-auto stroke-1 text-muted-foreground/60 mb-3" />
              <h3 className="font-semibold text-foreground">No upcoming revisions</h3>
              <p className="text-xs max-w-sm mx-auto mt-1">
                Add more problems to schedule long-term spaced intervals.
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}


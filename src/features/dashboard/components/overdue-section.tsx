import Link from "next/link"
import { AlertTriangle, ArrowRight, CheckCircle2, RotateCcw } from "lucide-react"
import { Badge, Button, Card } from "@/components/ui"
import { DifficultyBadge } from "@/components/shared/difficulty-badge"
import type { OverdueProblemItem } from "../types"

export interface OverdueSectionProps {
  overdueItems: OverdueProblemItem[]
}

export function OverdueSection({ overdueItems }: OverdueSectionProps) {
  if (overdueItems.length === 0) {
    return (
      <Card className="border-emerald-200/60 bg-emerald-50/20 p-5">
        <div className="flex items-center gap-3 text-emerald-800">
          <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <div className="font-semibold text-foreground">All caught up!</div>
            <div className="text-xs text-muted-foreground">
              You have no overdue revisions pending. Keep up the consistent cadence!
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-red-200/80 bg-red-50/15 overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-red-100/80 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-danger">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">Overdue Revisions</span>
              <Badge tone="danger">
                {overdueItems.length} {overdueItems.length === 1 ? "problem" : "problems"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Prioritize these spaced repetition intervals to avoid forgetting curve loss
            </p>
          </div>
        </div>
        <Button variant="danger" size="sm" asChild>
          <Link href="/revisions">
            <RotateCcw className="size-4" />
            Revise overdue now
          </Link>
        </Button>
      </div>

      <div className="divide-y divide-red-100/60">
        {overdueItems.map(({ problem, daysOverdue }) => (
          <div
            key={problem.id}
            className="flex flex-col gap-3 p-4 transition-colors hover:bg-red-50/30 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/problems/${problem.id}`}
                  className="font-semibold text-foreground hover:text-primary hover:underline"
                >
                  {problem.title}
                </Link>
                <Badge tone="danger">
                  {daysOverdue} {daysOverdue === 1 ? "day" : "days"} overdue
                </Badge>
                <DifficultyBadge value={problem.difficulty} />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{problem.platform}</span>
                <span>•</span>
                <span>Interval {problem.revision}</span>
                <span>•</span>
                <div className="flex gap-1.5">
                  {problem.topics.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/problems/${problem.id}`}>
                  Details
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/revisions">
                  Start
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

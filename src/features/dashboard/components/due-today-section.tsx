import Link from "next/link"
import { ArrowRight, CalendarCheck, Clock, RotateCcw } from "lucide-react"
import { Badge, Button, Card } from "@/components/ui"
import { DifficultyBadge } from "@/components/shared/difficulty-badge"
import type { Problem } from "@/types/problem"
import { cn } from "@/lib/utils"

export interface DueTodaySectionProps {
  problems: Problem[]
}

export function DueTodaySection({ problems }: DueTodaySectionProps) {
  if (problems.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <CalendarCheck className="size-6" />
        </div>
        <h3 className="mt-3 text-base font-semibold">Today's queue is empty</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          You don't have any revisions scheduled for today. Check upcoming revisions or add new problems to keep moving forward.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/problems">Browse problems</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/problems/new">Add problem</Link>
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-2 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-foreground">Today’s Revision Queue</h2>
            <Badge tone="warning">{problems.length} due</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Prioritized by urgency, difficulty, and interval curve
          </p>
        </div>
        <Button variant="soft" size="sm" asChild>
          <Link href="/revisions">
            <RotateCcw className="size-4" />
            Start revision
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="divide-y">
        {problems.map((p, i) => (
          <div
            key={p.id}
            className="group flex flex-col gap-3 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3.5">
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                  i === 0
                    ? "bg-amber-100 text-warning"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {i + 1}
              </div>
              <div className="min-w-0">
                <Link
                  href={`/problems/${p.id}`}
                  className="font-semibold text-foreground group-hover:text-primary group-hover:underline"
                >
                  {p.title}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{p.platform}</span>
                  <span>•</span>
                  <span>Revision interval {p.revision}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    ~{p.time || 25} min
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <DifficultyBadge value={p.difficulty} />
                  {p.topics.map((t) => (
                    <Badge key={t} tone="primary" className="text-[11px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/problems/${p.id}`}>
                  View
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/revisions">
                  Revise
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

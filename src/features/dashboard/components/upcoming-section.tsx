import Link from "next/link"
import { ArrowRight, Calendar, ExternalLink } from "lucide-react"
import { Badge, Button, Card } from "@/components/ui"
import { DifficultyBadge } from "@/components/shared/difficulty-badge"
import type { Problem } from "@/types/problem"

export interface UpcomingSectionProps {
  problems: Problem[]
}

export function UpcomingSection({ problems }: UpcomingSectionProps) {
  if (problems.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Calendar className="size-5" />
        </div>
        <div className="mt-2 text-sm font-semibold">No upcoming revisions scheduled</div>
        <p className="mt-1 text-xs text-muted-foreground">
          New revisions will appear here automatically as your interval intervals mature.
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-foreground">Upcoming Revisions</h2>
          <div className="text-xs text-muted-foreground">
            Scheduled intervals across the next 14 days
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/problems">
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>

      <div className="mt-4 divide-y">
        {problems.slice(0, 4).map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            <div className="min-w-0 flex-1 pr-3">
              <div className="flex items-center gap-2">
                <Link
                  href={`/problems/${p.id}`}
                  className="truncate text-sm font-semibold text-foreground hover:text-primary hover:underline"
                >
                  {p.title}
                </Link>
                <DifficultyBadge value={p.difficulty} />
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-medium text-foreground/80">
                  <Calendar className="size-3 text-primary" />
                  {p.nextRevision}
                </span>
                <span>•</span>
                <span>{p.platform}</span>
                <span>•</span>
                <span>Interval {p.revision}</span>
              </div>
            </div>

            <Button variant="ghost" size="icon" asChild>
              <Link href={`/problems/${p.id}`}>
                <ExternalLink className="size-4" />
                <span className="sr-only">View problem</span>
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}

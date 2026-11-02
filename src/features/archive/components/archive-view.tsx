"use client" /* Header and Back Link */ /* Info Card */ /* List Card */

import Link from "next/link"
import { Archive, ArrowLeft, CircleHelp, Eye, RotateCcw } from "lucide-react"
import { Badge, Button, Card } from "@/components/ui"
import { DifficultyBadge } from "@/components/shared/difficulty-badge"
import type { Problem } from "@/types/problem"

export interface ArchiveViewProps {
  items: Problem[]
  restore: (id: number) => void
}

export function ArchiveView({ items, restore }: ArchiveViewProps) {
  const archived = items.filter((p) => p.status === "Archived")

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="-ml-2 text-muted-foreground"
            >
              <Link href="/problems">
                <ArrowLeft className="size-4 mr-1.5" />
                Active Problems
              </Link>
            </Button>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Archived Problems
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Problems removed from active revision schedules and metrics (
            {archived.length} total).
          </p>
        </div>
      </div>

      {}
      <Card className="flex items-start gap-3 border-amber-300 bg-amber-50/70 p-4 dark:bg-amber-950/20">
        <CircleHelp className="mt-0.5 size-5 shrink-0 text-warning" />
        <div>
          <div className="text-sm font-semibold text-foreground">
            Archived problems are paused
          </div>
          <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
            They won't appear in your daily Due Today queues, overdue counts, or
            analytics. All solution notes and revision attempt history are
            preserved. Restore anytime to resume spaced repetition.
          </div>
        </div>
      </Card>

      {}
      <Card className="overflow-hidden">
        {archived.length > 0 ? (
          <div className="divide-y">
            {archived.map((p) => (
              <div
                key={p.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground shrink-0 mt-0.5">
                    <Archive className="size-5" />
                  </div>
                  <div>
                    <Link
                      href={`/problems/${p.id}`}
                      className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                    >
                      {p.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{p.platform || "Platform"}</span>
                      <span>·</span>
                      <DifficultyBadge value={p.difficulty} />
                      {p.topics?.length > 0 && (
                        <>
                          <span>·</span>
                          <span className="truncate max-w-xs">
                            {p.topics.join(", ")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/problems/${p.id}`}>
                      <Eye className="size-4 mr-1.5" />
                      View
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => restore(p.id)}
                    className="text-primary hover:text-primary"
                  >
                    <RotateCcw className="size-4 mr-1.5" />
                    Restore
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <Archive className="size-10 stroke-1 text-muted-foreground/60" />
            <h3 className="mt-3 text-base font-semibold text-foreground">
              No archived problems
            </h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              When you archive problems from your active list, they will appear
              here safely stored.
            </p>
            <Button variant="outline" size="sm" asChild className="mt-5">
              <Link href="/problems">Go to Problems</Link>
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}

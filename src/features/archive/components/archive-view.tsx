import { Archive, CircleHelp, RotateCcw } from "lucide-react"
import { Button, Card } from "@/components/ui"
import type { Problem } from "@/types/problem"

export interface ArchiveViewProps {
  items: Problem[]
  restore: (id: number) => void
}

export function ArchiveView({ items, restore }: ArchiveViewProps) {
  const archived = items.filter((p) => p.status === "Archived")
  return (
    <div className="space-y-5">
      <Card className="flex items-start gap-3 bg-amber-50/70 p-4">
        <CircleHelp className="mt-0.5 size-5 shrink-0 text-warning" />
        <div>
          <div className="text-sm font-semibold">
            Archived problems are paused
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            They won’t appear in your revision queue or analytics. Restore one
            anytime to continue its schedule.
          </div>
        </div>
      </Card>
      <Card className="overflow-hidden">
        {archived.length ? (
          <div className="divide-y">
            {archived.map((p) => (
              <div
                key={p.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Archive className="size-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{p.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {p.platform} · {p.difficulty} · {p.topics.join(", ")}
                  </div>
                </div>
                <Button variant="outline" onClick={() => restore(p.id)}>
                  <RotateCcw className="size-4" />
                  Restore
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            No archived problems.
          </div>
        )}
      </Card>
    </div>
  )
}

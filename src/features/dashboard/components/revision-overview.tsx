import { Badge, Card, Progress } from "@/components/ui"
import { cn } from "@/lib/utils"
import { defaultUpcomingDays } from "../data/dashboard-data"

export interface RevisionOverviewProps {
  completedCount?: number
  totalCount?: number
}

export function RevisionOverview({
  completedCount = 18,
  totalCount = 23,
}: RevisionOverviewProps) {
  const percentage = Math.round((completedCount / (totalCount || 1)) * 100)

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-foreground">Revision Outlook</h2>
          <div className="text-xs text-muted-foreground">Next 7 days schedule</div>
        </div>
        <Badge tone="primary">{totalCount} total scheduled</Badge>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">
        {defaultUpcomingDays.map((d) => (
          <div
            key={d.date}
            className={cn(
              "rounded-xl py-3 text-center transition-all",
              d.active
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                : "bg-muted hover:bg-muted/80",
            )}
          >
            <div
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wider",
                !d.active && "text-muted-foreground",
              )}
            >
              {d.day}
            </div>
            <div className="my-1 text-base font-bold sm:text-lg">{d.date}</div>
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

      <div className="mt-5 rounded-xl bg-muted/60 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground">Weekly completion</span>
          <span className="font-bold text-primary">{percentage}%</span>
        </div>
        <Progress className="mt-2.5" value={percentage} />
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{completedCount} of {totalCount} revisions completed</span>
          <span>{totalCount - completedCount} remaining</span>
        </div>
      </div>
    </Card>
  )
}

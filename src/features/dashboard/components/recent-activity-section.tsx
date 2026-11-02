import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button, Card } from "@/components/ui"
import { activities } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function RecentActivitySection() {
  const recentItems = activities.slice(0, 4)

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-foreground">Recent Activity</h2>
          <div className="text-xs text-muted-foreground">
            Completed revisions and assessment logs
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/activity">
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>

      <div className="mt-3 divide-y">
        {recentItems.map((a, i) => (
          <div key={`${a.problem}-${i}`} className="flex gap-3 py-3">
            <div
              className={cn(
                "mt-1.5 size-2 shrink-0 rounded-full",
                a.tone === "success"
                  ? "bg-emerald-500"
                  : a.tone === "warning"
                    ? "bg-amber-500"
                    : a.tone === "primary"
                      ? "bg-primary"
                      : "bg-muted-foreground",
              )}
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm">
                <span className="font-semibold text-foreground">{a.action}</span>
                {" · "}
                <span className="text-foreground/90">{a.problem}</span>
              </div>
              <div className="text-xs text-muted-foreground">{a.detail}</div>
            </div>
            <div className="shrink-0 text-xs text-muted-foreground">
              {a.time.split(",")[0]}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

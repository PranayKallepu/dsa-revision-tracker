import {
  BrainCircuit,
  CheckCircle2,
  Flame,
  Timer,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { Badge, Card, Progress } from "@/components/ui"
import { StatCard } from "@/components/shared/stat-card"
import { cn } from "@/lib/utils"

export function AnalyticsView() {
  const bars = [42, 58, 48, 74, 66, 88, 78]
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revision completion"
          value="84%"
          note="+6% vs last month"
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Average solve time"
          value="24m"
          note="4m faster this month"
          icon={Timer}
        />
        <StatCard
          label="Recall accuracy"
          value="76%"
          note="Good or Easy ratings"
          icon={BrainCircuit}
          tone="warning"
        />
        <StatCard
          label="Current streak"
          value="12d"
          note="Personal best: 15 days"
          icon={Flame}
          tone="danger"
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-bold">Revision consistency</div>
              <div className="text-sm text-muted-foreground">
                Completed revisions over 7 days
              </div>
            </div>
            <Badge tone="success">
              <TrendingUp className="mr-1 size-3" />
              +18%
            </Badge>
          </div>
          <div className="mt-8 flex h-52 items-end gap-3 sm:gap-5">
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex h-full flex-1 flex-col justify-end gap-2"
              >
                <div className="relative flex-1">
                  <div
                    className={cn(
                      "absolute bottom-0 w-full rounded-t-lg bg-primary/80",
                      h === 42
                        ? "h-[42%]"
                        : h === 58
                          ? "h-[58%]"
                          : h === 48
                            ? "h-[48%]"
                            : h === 74
                              ? "h-[74%]"
                              : h === 66
                                ? "h-[66%]"
                                : h === 88
                                  ? "h-[88%]"
                                  : "h-[78%]",
                    )}
                  />
                </div>
                <div className="text-center text-xs text-muted-foreground">
                  {["M", "T", "W", "T", "F", "S", "S"][i]}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <div className="font-bold">Rating distribution</div>
          <div className="mt-6 space-y-5">
            {[
              ["Easy", 18, "bg-emerald-500"],
              ["Good", 52, "bg-primary"],
              ["Difficult", 23, "bg-amber-500"],
              ["Forgot", 7, "bg-red-500"],
            ].map(([n, v, c]) => (
              <div key={n}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium">{n}</span>
                  <span className="text-muted-foreground">{v}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-2 rounded-full",
                      c,
                      v === 18
                        ? "w-[18%]"
                        : v === 52
                          ? "w-[52%]"
                          : v === 23
                            ? "w-[23%]"
                            : "w-[7%]",
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold">Solving time trend</div>
              <div className="text-sm text-muted-foreground">
                Average minutes by week
              </div>
            </div>
            <Badge tone="success">
              <TrendingDown className="mr-1 size-3" />
              -14%
            </Badge>
          </div>
          <div className="mt-8 flex items-end justify-between gap-4">
            {[
              ["W1", 38],
              ["W2", 34],
              ["W3", 30],
              ["W4", 27],
              ["W5", 24],
            ].map(([w, v]) => (
              <div key={w} className="flex flex-1 flex-col items-center gap-2">
                <div className="text-sm font-bold">{v}m</div>
                <div
                  className={cn(
                    "w-full rounded-t-lg bg-secondary",
                    v === 38
                      ? "h-28"
                      : v === 34
                        ? "h-24"
                        : v === 30
                          ? "h-20"
                          : v === 27
                            ? "h-16"
                            : "h-14",
                  )}
                />
                <div className="text-xs text-muted-foreground">{w}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <div className="font-bold">Topic performance</div>
          <div className="mt-5 space-y-4">
            {[
              ["Arrays & Hashing", 86, 42],
              ["Trees", 78, 25],
              ["Graphs", 68, 19],
              ["Dynamic Programming", 54, 14],
            ].map(([n, score, count]) => (
              <div key={n as string}>
                <div className="mb-2 flex justify-between">
                  <div>
                    <span className="text-sm font-semibold">{n}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {count} problems
                    </span>
                  </div>
                  <span className="text-sm font-bold">{score}%</span>
                </div>
                <Progress value={score as number} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

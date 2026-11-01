import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Code2,
  Edit3,
  ExternalLink,
  Lightbulb,
  RotateCcw,
  Sparkles,
} from "lucide-react"
import { Badge, Button, Card } from "@/components/ui"
import { DifficultyBadge } from "@/components/shared/difficulty-badge"
import { cn } from "@/lib/utils"
import type { Screen } from "@/types/navigation"

export interface ProblemDetailsProps {
  setScreen: (s: Screen) => void
}

export function ProblemDetails({ setScreen }: ProblemDetailsProps) {
  const steps = [
    "Added",
    "Day 1",
    "Day 3",
    "Day 7",
    "Day 15",
    "Day 30",
    "Day 60",
  ]
  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Button
          variant="ghost"
          className="w-fit"
          onClick={() => setScreen("problems")}
        >
          <ArrowLeft className="size-4" />
          Back to problems
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit3 className="size-4" />
            Edit
          </Button>
          <Button onClick={() => setScreen("revision")}>
            <RotateCcw className="size-4" />
            Start revision
          </Button>
        </div>
      </div>
      <Card className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
            <Code2 className="size-6" />
          </div>
          <div className="flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <DifficultyBadge value="Medium" />
              <Badge tone="danger">Overdue</Badge>
              <Badge>LeetCode</Badge>
            </div>
            <div className="text-2xl font-bold tracking-tight">
              Longest Substring Without Repeating Characters
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Sliding Window", "Hash Map", "String"].map((t) => (
                <Badge key={t} tone="primary">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
          <Button variant="outline" size="sm">
            <ExternalLink className="size-4" />
            Open problem
          </Button>
        </div>
      </Card>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2 font-bold">
              <Lightbulb className="size-5 text-primary" />
              Approach & notes
            </div>
            <div className="space-y-4 text-sm leading-7 text-muted-foreground">
              <p>
                Use a sliding window with a hash map storing the latest index of
                each character. When a repeated character appears inside the
                current window, move the left pointer just beyond its previous
                position.
              </p>
              <div className="rounded-xl bg-muted p-4 font-mono text-xs text-foreground">
                left = max(left, lastSeen[char] + 1)
                <br />
                maxLength = max(maxLength, right - left + 1)
              </div>
              <p>
                <strong className="text-foreground">Key gotcha:</strong> Never
                move the left pointer backwards when the repeated character is
                outside the active window.
              </p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border p-3">
                <div className="text-xs text-muted-foreground">
                  Time complexity
                </div>
                <div className="mt-1 font-mono font-bold">O(n)</div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-xs text-muted-foreground">
                  Space complexity
                </div>
                <div className="mt-1 font-mono font-bold">O(min(n, m))</div>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="mb-4 font-bold">Attempt history</div>
            <div className="space-y-3">
              {[
                ["Today", "28 min", "Difficult"],
                ["Jun 5", "24 min", "Good"],
                ["Jun 2", "36 min", "Good"],
                ["May 31", "48 min", "Forgot"],
              ].map((a, i) => (
                <div
                  key={a[0]}
                  className="flex items-center gap-3 rounded-xl border p-3"
                >
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full",
                      i === 0
                        ? "bg-amber-50 text-warning"
                        : "bg-emerald-50 text-success",
                    )}
                  >
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">
                      Revision {4 - i}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {a[0]} · {a[1]}
                    </div>
                  </div>
                  <Badge
                    tone={
                      a[2] === "Forgot"
                        ? "danger"
                        : a[2] === "Difficult"
                          ? "warning"
                          : "success"
                    }
                  >
                    {a[2]}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="space-y-5">
          <Card className="p-6">
            <div className="font-bold">Revision timeline</div>
            <div className="mt-5 space-y-0">
              {steps.map((s, i) => (
                <div key={s} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full",
                        i < 4
                          ? "bg-primary text-white"
                          : "border-2 bg-white text-muted-foreground",
                      )}
                    >
                      {i < 4 ? (
                        <Check className="size-3.5" />
                      ) : (
                        <span className="text-[10px]">{i}</span>
                      )}
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className={cn(
                          "h-10 w-px",
                          i < 3 ? "bg-primary" : "bg-border",
                        )}
                      />
                    )}
                  </div>
                  <div className="pt-1 text-sm">
                    <span className="font-semibold">{s}</span>
                    <span className="ml-2 text-muted-foreground">
                      {i === 4 ? "Due today" : i < 4 ? "Completed" : "Upcoming"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="border-primary/20 bg-secondary/40 p-5">
            <div className="flex items-center gap-2 font-bold text-secondary-foreground">
              <Sparkles className="size-5" />
              Mastery unlock
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              You’ve completed 4 revisions. Pass a timed mastery test when you
              feel ready.
            </p>
            <Button
              className="mt-4 w-full"
              variant="soft"
              onClick={() => setScreen("mastery")}
            >
              Take mastery test
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

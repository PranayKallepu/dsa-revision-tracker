"use client"

import { useState } from "react"
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  Timer,
  X,
} from "lucide-react"
import {
  Badge,
  Button,
  Card,
  Input,
  Label,
  Progress,
  Textarea,
} from "@/components/ui"
import { cn } from "@/lib/utils"
import type { Screen } from "@/types/navigation"

export interface RevisionWorkspaceProps {
  setScreen: (s: Screen) => void
}

export function RevisionWorkspace({ setScreen }: RevisionWorkspaceProps) {
  const [revealed, setRevealed] = useState(false)
  const [rated, setRated] = useState(false)

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5 flex items-center justify-between">
        <Button variant="ghost" onClick={() => setScreen("dashboard")}>
          <X className="size-4" />
          Exit session
        </Button>
        <div className="text-sm font-medium text-muted-foreground">
          Problem 1 of 5
        </div>
      </div>
      <Progress value={20} className="mb-6" />
      <Card className="overflow-hidden">
        <div className="border-b bg-gradient-to-r from-indigo-50 to-white p-6 sm:p-8">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge tone="warning">Medium</Badge>
            <Badge>Sliding Window</Badge>
            <Badge>Revision 4</Badge>
          </div>
          <div className="text-2xl font-bold sm:text-3xl">
            Longest Substring Without Repeating Characters
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Given a string, find the length of the longest substring without
            repeating characters.
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Timer className="size-4" />
              Elapsed 08:42
            </span>
            <span className="flex items-center gap-2">
              <Clock3 className="size-4" />
              Previous 28 min
            </span>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          {!revealed ? (
            <div className="py-8 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-secondary text-primary">
                <BrainCircuit className="size-8" />
              </div>
              <div className="mt-5 text-xl font-bold">
                Recall before you reveal
              </div>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                Explain the core approach, complexity, and edge cases from
                memory. This productive struggle is where learning happens.
              </p>
              <Textarea
                className="mx-auto mt-6 max-w-2xl text-left"
                placeholder="Write your approach from memory…"
              />
              <Button
                className="mt-5"
                size="lg"
                onClick={() => setRevealed(true)}
              >
                <Eye className="size-4" />
                Reveal my notes
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold">Your saved approach</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRevealed(false)}
                >
                  <EyeOff className="size-4" />
                  Hide
                </Button>
              </div>
              <div className="rounded-2xl border bg-muted/40 p-5 text-sm leading-7 text-muted-foreground">
                <p>
                  Maintain a sliding window and a map of each character’s most
                  recent index. If a duplicate appears within the window,
                  advance the left pointer beyond its previous position.
                </p>
                <div className="mt-3 flex gap-3">
                  <Badge tone="primary">Time O(n)</Badge>
                  <Badge tone="primary">Space O(min(n,m))</Badge>
                </div>
              </div>
              <div>
                <Label>How long did this attempt take?</Label>
                <div className="relative max-w-xs">
                  <Input type="number" defaultValue="24" />
                  <span className="absolute right-3 top-3 text-sm text-muted-foreground">
                    minutes
                  </span>
                </div>
              </div>
              <div>
                <div className="mb-3 font-bold">
                  How well did you recall it?
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  {[
                    ["Forgot", "Couldn’t recall", "danger"],
                    ["Difficult", "Needed hints", "warning"],
                    ["Good", "Mostly fluent", "primary"],
                    ["Easy", "Instant recall", "success"],
                  ].map(([name, sub, tone]) => (
                    <button
                      key={name}
                      onClick={() => setRated(true)}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md",
                        rated &&
                          name === "Good" &&
                          "border-primary bg-secondary ring-2 ring-primary/10",
                      )}
                    >
                      <div className="font-bold">{name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {sub}
                      </div>
                      <div
                        className={cn(
                          "mt-3 text-[11px] font-semibold",
                          tone === "danger"
                            ? "text-danger"
                            : tone === "warning"
                              ? "text-warning"
                              : tone === "success"
                                ? "text-success"
                                : "text-primary",
                        )}
                      >
                        {name === "Forgot" || name === "Difficult"
                          ? "Restart tomorrow"
                          : "Continue schedule"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {rated && (
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4 text-sm text-success">
                  <span className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="size-4" />
                    Saved. Next review in 15 days.
                  </span>
                  <Button onClick={() => setScreen("dashboard")}>
                    Next problem <ArrowRight className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
      <div className="mt-4 text-center text-xs text-muted-foreground">
        Day 1 → 3 → 7 → 15 → 30 → 60 → every 30 days
      </div>
    </div>
  )
}

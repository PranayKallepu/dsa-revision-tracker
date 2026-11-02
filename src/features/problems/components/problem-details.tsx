"use client"

// Not-found state if invalid problem ID
/* 1. Navigation & Actions Bar */ /* Archive Notice Banner if problem is archived */ /* 2. Main Hero Card */ /* 3. Detailed Sections Grid */ /* Left Column: Solution Reflection, Notes & Attempts */ /* Approach Card */ /* Complexity Badges */ /* Personal Notes & Gotchas */ /* Attempt History Card */ /* Right Column: Spaced Repetition Timeline & Mastery */ /* Spaced Repetition Timeline */ /* Mastery Unlock Card */

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Edit3,
  ExternalLink,
  FileText,
  Lightbulb,
  RotateCcw,
  Sparkles,
} from "lucide-react"
import { Badge, Button, Card } from "@/components/ui"
import { DifficultyBadge } from "@/components/shared/difficulty-badge"
import { useProblems } from "@/hooks/use-problems"
import { cn } from "@/lib/utils"
import type { Screen } from "@/types/navigation"
import type { Problem } from "@/types/problem"

export interface ProblemDetailsProps {
  problemId?: string | number
  problem?: Problem
  setScreen?: (s: Screen) => void
}

export function ProblemDetails({
  problemId,
  problem: propProblem,
  setScreen,
}: ProblemDetailsProps) {
  const router = useRouter()
  const { getProblemById, archiveProblem, restoreProblem } = useProblems()

  const resolvedProblem =
    propProblem ||
    (problemId ? getProblemById(problemId) : undefined)

  const handleBack = () => {
    if (setScreen) {
      setScreen("problems")
    } else {
      router.push("/problems")
    }
  }

  const handleEdit = () => {
    if (resolvedProblem) {
      router.push(`/problems/${resolvedProblem.id}/edit`)
    }
  }

  const handleStartRevision = () => {
    if (setScreen) {
      setScreen("revision")
    } else {
      router.push("/revisions")
    }
  }

  const handleToggleArchive = () => {
    if (!resolvedProblem) return
    if (
      resolvedProblem.status ===
      "Archived"
    ) {
      restoreProblem(resolvedProblem.id)
    } else {
      archiveProblem(resolvedProblem.id)
    }
  }
  if (!resolvedProblem) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle className="size-7" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight">
          Problem Not Found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The requested problem could not be found. It may have been deleted or
          the link is incorrect.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={handleBack}>
            <ArrowLeft className="size-4 mr-2" />
            Back to Problems
          </Button>
        </div>
      </div>
    )
  }

  const steps = [
    { label: "Added", day: 0 },
    { label: "Day 1", day: 1 },
    { label: "Day 3", day: 3 },
    { label: "Day 7", day: 7 },
    { label: "Day 15", day: 15 },
    { label: "Day 30", day: 30 },
    { label: "Day 60", day: 60 },
  ]

  const currentRevisionIndex = Math.min(
    resolvedProblem.revision ?? 0,
    steps.length - 1,
  )

  const externalUrl =
    resolvedProblem.url.startsWith("http://") ||
    resolvedProblem.url.startsWith("https://")
      ? resolvedProblem.url
      : `https://${resolvedProblem.url}`

  const isArchived = resolvedProblem.status === "Archived"

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit -ml-2 text-muted-foreground hover:text-foreground"
          onClick={handleBack}
        >
          <ArrowLeft className="size-4 mr-1.5" />
          Back to problems
        </Button>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleArchive}
            className={
              isArchived
                ? "text-primary"
                : "text-muted-foreground hover:text-destructive"
            }
          >
            {isArchived ? (
              <>
                <RotateCcw className="size-4 mr-1.5" />
                Restore Problem
              </>
            ) : (
              <>
                <Archive className="size-4 mr-1.5" />
                Archive Problem
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit3 className="size-4 mr-1.5" />
            Edit Problem
          </Button>
          <Button size="sm" onClick={handleStartRevision} disabled={isArchived}>
            <RotateCcw className="size-4 mr-1.5" />
            Start Revision
          </Button>
        </div>
      </div>

      {}
      {isArchived && (
        <Card className="flex items-center justify-between border-amber-300 bg-amber-50/70 p-4 dark:bg-amber-950/20">
          <div className="flex items-center gap-3">
            <Archive className="size-5 text-warning shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                This problem is currently archived
              </p>
              <p className="text-xs text-muted-foreground">
                It is hidden from active revision queues and daily metrics.
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={handleToggleArchive}>
            Restore to Active
          </Button>
        </Card>
      )}

      {}
      <Card className="p-6 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
              <Code2 className="size-6" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <DifficultyBadge value={resolvedProblem.difficulty} />
                <Badge
                  tone={
                    resolvedProblem.status === "Mastered"
                      ? "success"
                      : resolvedProblem.status === "Overdue"
                        ? "danger"
                        : resolvedProblem.status === "Archived"
                          ? "neutral"
                          : "primary"
                  }
                >
                  {resolvedProblem.status}
                </Badge>
                <Badge tone="neutral">
                  {resolvedProblem.platform || "Platform"}
                </Badge>
                {resolvedProblem.time ? (
                  <Badge tone="neutral" className="gap-1">
                    <Clock className="size-3" />
                    {resolvedProblem.time} min initial solve
                  </Badge>
                ) : null}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {resolvedProblem.title}
              </h1>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {resolvedProblem.topics.map((t) => (
                  <Badge key={t} tone="primary" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start pt-1">
            <Button variant="outline" size="sm" asChild>
              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-1.5"
              >
                <span>Open in {resolvedProblem.platform || "Browser"}</span>
                <ExternalLink className="size-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </Card>

      {}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {}
        <div className="space-y-6">
          {}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2 font-bold text-foreground">
              <Lightbulb className="size-5 text-primary" />
              <span>Approach & Intuition</span>
            </div>
            {resolvedProblem.approach ? (
              <div className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {resolvedProblem.approach}
              </div>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                No solution approach recorded yet. Click "Edit Problem" to
                document your approach.
              </p>
            )}

            {}
            <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-5">
              <div className="rounded-xl border bg-muted/30 p-3.5">
                <div className="text-xs text-muted-foreground font-medium">
                  Time complexity
                </div>
                <div className="mt-1 font-mono font-bold text-foreground">
                  {resolvedProblem.timeComplexity || "O(?)"}
                </div>
              </div>
              <div className="rounded-xl border bg-muted/30 p-3.5">
                <div className="text-xs text-muted-foreground font-medium">
                  Space complexity
                </div>
                <div className="mt-1 font-mono font-bold text-foreground">
                  {resolvedProblem.spaceComplexity || "O(?)"}
                </div>
              </div>
            </div>
          </Card>

          {}
          {(resolvedProblem.notes || resolvedProblem.mistakes) && (
            <div className="grid gap-6 sm:grid-cols-2">
              {resolvedProblem.notes && (
                <Card className="p-5">
                  <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                    <FileText className="size-4 text-primary" />
                    <span>Personal Notes</span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
                    {resolvedProblem.notes}
                  </p>
                </Card>
              )}
              {resolvedProblem.mistakes && (
                <Card className="border-warning/30 bg-warning/5 p-5">
                  <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                    <AlertTriangle className="size-4 text-warning" />
                    <span>Mistakes & Pitfalls</span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
                    {resolvedProblem.mistakes}
                  </p>
                </Card>
              )}
            </div>
          )}

          {}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-foreground">
                Attempt & Revision History
              </h2>
              <span className="text-xs text-muted-foreground">
                {resolvedProblem.attempts?.length ?? 0} attempt
                {resolvedProblem.attempts?.length === 1 ? "" : "s"}
              </span>
            </div>

            {resolvedProblem.attempts && resolvedProblem.attempts.length > 0 ? (
              <div className="space-y-3">
                {resolvedProblem.attempts.map((attempt, i) => (
                  <div
                    key={attempt.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3.5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                          attempt.rating === "Good" || attempt.rating === "Easy"
                            ? "bg-emerald-50 text-success"
                            : attempt.rating === "Difficult"
                              ? "bg-amber-50 text-warning"
                              : "bg-rose-50 text-destructive",
                        )}
                      >
                        <CheckCircle2 className="size-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          Revision {resolvedProblem.attempts!.length - i}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {attempt.date} · {attempt.timeSpent} min
                          {attempt.notes ? ` · "${attempt.notes}"` : ""}
                        </div>
                      </div>
                    </div>
                    <Badge
                      tone={
                        attempt.rating === "Forgot"
                          ? "danger"
                          : attempt.rating === "Difficult"
                            ? "warning"
                            : "success"
                      }
                      className="self-start sm:self-center"
                    >
                      {attempt.rating}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
                <p className="text-sm">No revision attempts logged yet.</p>
                <p className="mt-1 text-xs">
                  Revisions are scheduled via spaced repetition. Click "Start
                  Revision" when ready.
                </p>
              </div>
            )}
          </Card>
        </div>

        {}
        <div className="space-y-6">
          {}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-foreground">
                Spaced Repetition Schedule
              </h2>
              <Badge tone="neutral" className="text-xs">
                Stage {currentRevisionIndex} of {steps.length - 1}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-6">
              Next scheduled review:{" "}
              <strong className="text-foreground">
                {resolvedProblem.nextRevision}
              </strong>
            </p>

            <div className="space-y-0">
              {steps.map((s, i) => {
                const isPassed = i <= currentRevisionIndex
                const isCurrent = i === currentRevisionIndex

                return (
                  <div key={s.label} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "flex size-7 items-center justify-center rounded-full text-xs transition-colors",
                          isPassed
                            ? "bg-primary text-white"
                            : "border-2 border-border bg-background text-muted-foreground",
                        )}
                      >
                        {isPassed ? (
                          <Check className="size-3.5" />
                        ) : (
                          <span className="text-[10px]">{i}</span>
                        )}
                      </div>
                      {i < steps.length - 1 && (
                        <div
                          className={cn(
                            "h-9 w-0.5",
                            i < currentRevisionIndex
                              ? "bg-primary"
                              : "bg-border",
                          )}
                        />
                      )}
                    </div>
                    <div className="pt-1 text-sm">
                      <span className="font-semibold text-foreground">
                        {s.label}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {isCurrent
                          ? "Current interval"
                          : isPassed
                            ? "Completed"
                            : "Upcoming"}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {}
          <Card className="border-primary/20 bg-secondary/30 p-5">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Sparkles className="size-5 text-primary" />
              <span>Mastery Unlock</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {resolvedProblem.status === "Mastered"
                ? "Congratulations! You have mastered this problem under timed spaced repetition conditions."
                : `You've completed ${resolvedProblem.revision} revision(s). Pass a timed mastery test without hints to solidify your recall.`}
            </p>
            <Button
              className="mt-4 w-full"
              variant={
                resolvedProblem.status === "Mastered" ? "outline" : "default"
              }
              size="sm"
              asChild
            >
              <Link href="/mastery">
                {resolvedProblem.status === "Mastered"
                  ? "Review in Mastery"
                  : "Take Mastery Test"}
              </Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

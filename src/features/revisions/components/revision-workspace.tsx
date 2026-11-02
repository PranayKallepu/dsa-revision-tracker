"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  ExternalLink,
  Eye,
  FileText,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
} from "lucide-react"
import {
  Badge,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Progress,
  Textarea,
} from "@/components/ui"
import { DifficultyBadge } from "@/components/shared/difficulty-badge"
import { useProblems } from "@/hooks/use-problems"
import {
  REVISION_RATING_OPTIONS,
  type RevisionRating,
} from "@/types/revision"
import { calculateNextRevision } from "../utils/scheduling"
import { cn } from "@/lib/utils"
import type { Screen } from "@/types/navigation"
import type { Problem } from "@/types/problem"

export interface RevisionWorkspaceProps {
  problemId?: string | number
  problem?: Problem
  setScreen?: (s: Screen) => void
}

type RevisionStage = 1 | 2 | 3 | 4 | 5

const STAGE_NAMES = [
  "Recall",
  "Reveal Notes",
  "Self Assessment",
  "Solving Time",
  "Review & Complete",
]

export function RevisionWorkspace({
  problemId,
  problem: propProblem,
  setScreen,
}: RevisionWorkspaceProps) {
  const router = useRouter()
  const { items, getProblemById, completeRevision, getDueRevisions } = useProblems()

  // Resolve the problem to revise:
  // 1. propProblem
  // 2. lookup by problemId
  // 3. first problem in due queue
  // 4. first problem in items
  const resolvedProblem =
    propProblem ||
    (problemId ? getProblemById(problemId) : undefined) ||
    getDueRevisions()[0] ||
    items[0]

  // Workflow stage state
  const [stage, setStage] = useState<RevisionStage>(1)

  // Stage 1 (Recall) state
  const [recallScratchpad, setRecallScratchpad] = useState("")

  // Stage 3 (Self Assessment) state
  const [selectedRating, setSelectedRating] = useState<RevisionRating | null>(null)

  // Stage 4 (Solving Time) state
  const [minutesInput, setMinutesInput] = useState<string>("20")
  const [secondsInput, setSecondsInput] = useState<string>("0")
  const [skippedCoding, setSkippedCoding] = useState(false)
  const [timeError, setTimeError] = useState<string | null>(null)

  // Stage 5 & Completion state
  const [isCompleted, setIsCompleted] = useState(false)
  const [completionSummary, setCompletionSummary] = useState<{
    nextRevisionText: string
    cycleRestarted: boolean
    nextStatus: string
  } | null>(null)

  // Exit confirmation dialog
  const [exitDialogOpen, setExitDialogOpen] = useState(false)

  const handleExit = () => {
    if (stage > 1 && !isCompleted) {
      setExitDialogOpen(true)
    } else {
      confirmExit()
    }
  }

  const confirmExit = () => {
    setExitDialogOpen(false)
    if (setScreen) {
      setScreen("dashboard")
    } else {
      router.push("/revisions")
    }
  }

  // Not found fallback
  if (!resolvedProblem) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle className="size-7" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight">No Problem Selected</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          There are no pending revisions in your queue. Add problems or check upcoming intervals.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => router.push("/problems")}>
            Browse Problems
          </Button>
        </div>
      </div>
    )
  }

  // Calculate duration in minutes
  const getDurationInMinutes = (): number => {
    if (skippedCoding) return 0
    const mins = parseInt(minutesInput, 10) || 0
    const secs = parseInt(secondsInput, 10) || 0
    return Math.max(0, mins + Math.round((secs / 60) * 10) / 10)
  }

  // Validate Stage 4 time tracking
  const handleProceedToReview = () => {
    setTimeError(null)
    if (!skippedCoding) {
      const mins = parseInt(minutesInput, 10)
      const secs = parseInt(secondsInput, 10)

      if (isNaN(mins) || mins < 0) {
        setTimeError("Minutes cannot be negative.")
        return
      }
      if (isNaN(secs) || secs < 0 || secs >= 60) {
        setTimeError("Seconds must be between 0 and 59.")
        return
      }
      if (mins === 0 && secs === 0) {
        // Allow 0 if user explicitly didn't code
        setSkippedCoding(true)
      }
    }
    setStage(5)
  }

  // Stage 5: Final Submission
  const handleCompleteRevision = () => {
    if (!selectedRating) return

    const duration = getDurationInMinutes()

    const result = completeRevision(resolvedProblem.id, {
      rating: selectedRating,
      durationMinutes: duration > 0 ? duration : undefined,
      notes: recallScratchpad.trim() || undefined,
    })

    if (result) {
      setCompletionSummary({
        nextRevisionText: result.nextSchedule.nextRevisionDateText,
        cycleRestarted: result.nextSchedule.cycleRestarted,
        nextStatus: result.nextSchedule.nextStatus,
      })
      setIsCompleted(true)
    }
  }

  // Next due revisions after this problem
  const remainingDue = getDueRevisions().filter((p) => p.id !== resolvedProblem.id)

  const externalUrl =
    resolvedProblem.url.startsWith("http://") || resolvedProblem.url.startsWith("https://")
      ? resolvedProblem.url
      : `https://${resolvedProblem.url}`

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* 1. Header Bar with Exit and Progress */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit -ml-2 text-muted-foreground hover:text-foreground"
          onClick={handleExit}
        >
          <X className="size-4 mr-1.5" />
          Exit Session
        </Button>

        {/* Progress indicator */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Stage {stage} of 5: {STAGE_NAMES[stage - 1]}
          </span>
          <div className="w-28 sm:w-36">
            <Progress value={(stage / 5) * 100} className="h-2" />
          </div>
        </div>
      </div>

      {/* 2. Problem Overview Card */}
      <Card className="overflow-hidden border-primary/15 bg-gradient-to-r from-secondary/50 via-background to-background p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary shrink-0 mt-0.5">
              <BrainCircuit className="size-6" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <DifficultyBadge value={resolvedProblem.difficulty} />
                <Badge tone="primary">
                  Revision {resolvedProblem.revision ?? 1}
                </Badge>
                <Badge tone="neutral">Scheduled: {resolvedProblem.nextRevision}</Badge>
                <Badge tone="neutral">{resolvedProblem.platform}</Badge>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {resolvedProblem.title}
              </h1>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {resolvedProblem.topics.map((t) => (
                  <Badge key={t} tone="neutral" className="text-[11px]">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Button variant="outline" size="sm" asChild className="shrink-0 self-start">
            <a href={externalUrl} target="_blank" rel="noopener noreferrer">
              <span>Open problem</span>
              <ExternalLink className="size-3.5 ml-1.5" />
            </a>
          </Button>
        </div>
      </Card>

      {/* 3. Stage Content Containers */}
      {!isCompleted ? (
        <>
          {/* ================= STAGE 1: RECALL ================= */}
          {stage === 1 && (
            <Card className="p-6 sm:p-8 space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-3">
                <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-warning dark:bg-amber-950/40">
                  <Lightbulb className="size-7" />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  Try solving this problem without looking at your notes.
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Active recall triggers productive struggle. Attempt to formulate the
                  approach, key data structures, and edge cases from memory before revealing notes.
                </p>
              </div>

              {/* Memory Scratchpad */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="recall-notes" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Active Recall Scratchpad (Optional)
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Write key formulas, pseudocode, or pointers
                  </span>
                </div>
                <Textarea
                  id="recall-notes"
                  rows={6}
                  placeholder="e.g. Use a two-pointer sliding window with a hash map storing last seen index... left = max(left, lastSeen + 1)..."
                  value={recallScratchpad}
                  onChange={(e) => setRecallScratchpad(e.target.value)}
                  className="font-mono text-sm leading-relaxed"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t pt-5">
                <Button variant="outline" size="sm" asChild>
                  <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                    <Code2 className="size-4 mr-1.5" />
                    Open in {resolvedProblem.platform || "Platform"}
                  </a>
                </Button>
                <Button size="lg" onClick={() => setStage(2)} className="w-full sm:w-auto">
                  <Eye className="size-4 mr-2" />
                  Mark Recall Complete & Reveal Notes
                </Button>
              </div>
            </Card>
          )}

          {/* ================= STAGE 2: REVEAL NOTES ================= */}
          {stage === 2 && (
            <div className="space-y-6">
              <Card className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      Saved Solution Notes & Insights
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Compare your recall thoughts with your documented solution.
                    </p>
                  </div>
                  <Badge tone="success" className="gap-1">
                    <Check className="size-3" />
                    Recall Complete
                  </Badge>
                </div>

                {/* What user recalled vs saved notes */}
                {recallScratchpad && (
                  <div className="rounded-xl border bg-secondary/20 p-4 space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      What You Recalled From Memory:
                    </span>
                    <p className="font-mono text-xs text-foreground whitespace-pre-line">
                      {recallScratchpad}
                    </p>
                  </div>
                )}

                {/* Saved Approach */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Approach & Logic
                  </Label>
                  <div className="rounded-xl border bg-muted/40 p-5 text-sm leading-relaxed text-foreground whitespace-pre-line font-normal">
                    {resolvedProblem.approach || (
                      <span className="italic text-muted-foreground">
                        No approach details were documented for this problem.
                      </span>
                    )}
                  </div>
                </div>

                {/* Complexities */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border bg-muted/20 p-4">
                    <div className="text-xs font-medium text-muted-foreground">
                      Time Complexity
                    </div>
                    <div className="mt-1 font-mono font-bold text-foreground">
                      {resolvedProblem.timeComplexity || "O(?)"}
                    </div>
                  </div>
                  <div className="rounded-xl border bg-muted/20 p-4">
                    <div className="text-xs font-medium text-muted-foreground">
                      Space Complexity
                    </div>
                    <div className="mt-1 font-mono font-bold text-foreground">
                      {resolvedProblem.spaceComplexity || "O(?)"}
                    </div>
                  </div>
                </div>

                {/* Notes and Mistakes Callouts */}
                {(resolvedProblem.notes || resolvedProblem.mistakes) && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {resolvedProblem.notes && (
                      <div className="rounded-xl border p-4 space-y-1 bg-card">
                        <div className="flex items-center gap-1.5 font-semibold text-xs text-primary">
                          <FileText className="size-3.5" />
                          <span>Personal Notes</span>
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                          {resolvedProblem.notes}
                        </p>
                      </div>
                    )}
                    {resolvedProblem.mistakes && (
                      <div className="rounded-xl border border-warning/40 bg-warning/5 p-4 space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-xs text-warning">
                          <AlertTriangle className="size-3.5" />
                          <span>Mistakes & Pitfalls Made Previously</span>
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                          {resolvedProblem.mistakes}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between border-t pt-5">
                  <Button variant="ghost" size="sm" onClick={() => setStage(1)}>
                    <ArrowLeft className="size-4 mr-1.5" />
                    Back to Recall
                  </Button>
                  <Button size="lg" onClick={() => setStage(3)}>
                    Continue to Self Assessment
                    <ArrowRight className="size-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* ================= STAGE 3: SELF ASSESSMENT ================= */}
          {stage === 3 && (
            <Card className="p-6 sm:p-8 space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-lg font-bold text-foreground">
                  Self Assessment
                </h2>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Choose the rating that honestly reflects your recall accuracy without assistance.
                </p>
              </div>

              {/* 4 Rating Option Cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                {REVISION_RATING_OPTIONS.map((opt) => {
                  const isSelected = selectedRating === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedRating(opt.value)}
                      className={cn(
                        "flex flex-col justify-between text-left rounded-xl border p-5 transition-all cursor-pointer hover:shadow-sm",
                        isSelected
                          ? "border-primary bg-secondary/40 ring-2 ring-primary"
                          : "hover:border-primary/50 hover:bg-muted/30",
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-base text-foreground">
                            {opt.label}
                          </span>
                          <span
                            className={cn(
                              "text-xs font-semibold px-2 py-0.5 rounded-full",
                              opt.tone === "danger" && "bg-rose-100 text-rose-700 dark:bg-rose-950/40",
                              opt.tone === "warning" && "bg-amber-100 text-amber-700 dark:bg-amber-950/40",
                              opt.tone === "primary" && "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40",
                              opt.tone === "success" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40",
                            )}
                          >
                            {opt.value === "Forgot" || opt.value === "Difficult"
                              ? "Restarts"
                              : "Advances"}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                          {opt.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Clock className="size-3" />
                        <span>{opt.outcome}</span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {!selectedRating && (
                <p className="text-xs text-center text-muted-foreground italic">
                  * Please select a rating above before continuing.
                </p>
              )}

              <div className="flex items-center justify-between border-t pt-5">
                <Button variant="ghost" size="sm" onClick={() => setStage(2)}>
                  <ArrowLeft className="size-4 mr-1.5" />
                  Back to Notes
                </Button>
                <Button
                  size="lg"
                  disabled={!selectedRating}
                  onClick={() => setStage(4)}
                >
                  Continue to Solving Time
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {/* ================= STAGE 4: SOLVING TIME ================= */}
          {stage === 4 && (
            <Card className="p-6 sm:p-8 space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-lg font-bold text-foreground">
                  Record Solving Time
                </h2>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Log your manual solving duration to update personal speed and attempt analytics.
                </p>
              </div>

              <div className="max-w-md space-y-4">
                <div className="space-y-2">
                  <Label>Manual Solving Duration</Label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Input
                        type="number"
                        min="0"
                        max="1440"
                        value={minutesInput}
                        disabled={skippedCoding}
                        onChange={(e) => setMinutesInput(e.target.value)}
                        placeholder="Minutes"
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">
                        mins
                      </span>
                    </div>
                    <div className="relative flex-1">
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={secondsInput}
                        disabled={skippedCoding}
                        onChange={(e) => setSecondsInput(e.target.value)}
                        placeholder="Seconds"
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">
                        secs
                      </span>
                    </div>
                  </div>
                  {timeError && (
                    <p className="text-xs font-medium text-destructive mt-1">
                      {timeError}
                    </p>
                  )}
                </div>

                {/* Optional toggle if user only reviewed notes */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skippedCoding}
                      onChange={(e) => setSkippedCoding(e.target.checked)}
                      className="mt-0.5 rounded border-muted-foreground/30 text-primary"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-foreground">
                        Review only (did not write code)
                      </span>
                      <p className="text-muted-foreground">
                        Skips adding a new solving time attempt while still marking the revision complete.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-5">
                <Button variant="ghost" size="sm" onClick={() => setStage(3)}>
                  <ArrowLeft className="size-4 mr-1.5" />
                  Back to Assessment
                </Button>
                <Button size="lg" onClick={handleProceedToReview}>
                  Continue to Review & Complete
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {/* ================= STAGE 5: REVIEW & COMPLETE ================= */}
          {stage === 5 && (
            <Card className="p-6 sm:p-8 space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-lg font-bold text-foreground">
                  Review & Complete Revision
                </h2>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Confirm your evaluation before recording this revision and updating your spaced repetition queue.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border p-4 space-y-1 bg-muted/20">
                  <div className="text-xs font-semibold text-muted-foreground">
                    Problem
                  </div>
                  <div className="font-bold text-foreground line-clamp-1">
                    {resolvedProblem.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Revision #{resolvedProblem.revision ?? 1}
                  </div>
                </div>

                <div className="rounded-xl border p-4 space-y-1 bg-muted/20">
                  <div className="text-xs font-semibold text-muted-foreground">
                    Self Assessment Rating
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      tone={
                        selectedRating === "Forgot"
                          ? "danger"
                          : selectedRating === "Difficult"
                            ? "warning"
                            : selectedRating === "Good"
                              ? "primary"
                              : "success"
                      }
                      className="text-xs font-semibold"
                    >
                      {selectedRating}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedRating === "Forgot" || selectedRating === "Difficult"
                      ? "Restarts interval cycle; Day 1 due tomorrow"
                      : "Advances to next spaced repetition interval"}
                  </div>
                </div>

                <div className="rounded-xl border p-4 space-y-1 bg-muted/20">
                  <div className="text-xs font-semibold text-muted-foreground">
                    Recorded Solving Time
                  </div>
                  <div className="font-bold text-foreground">
                    {skippedCoding || getDurationInMinutes() === 0
                      ? "None (Notes review)"
                      : `${minutesInput}m ${secondsInput}s`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {skippedCoding
                      ? "No new attempt record created"
                      : "Will be logged to your attempt history"}
                  </div>
                </div>

                <div className="rounded-xl border p-4 space-y-1 bg-muted/20">
                  <div className="text-xs font-semibold text-muted-foreground">
                    Next Revision Expected
                  </div>
                  <div className="font-bold text-foreground">
                    {selectedRating === "Forgot" || selectedRating === "Difficult"
                      ? "Tomorrow"
                      : "Scheduled via Spaced Curve"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Calculated from original solve baseline
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-5">
                <Button variant="ghost" size="sm" onClick={() => setStage(4)}>
                  <ArrowLeft className="size-4 mr-1.5" />
                  Back
                </Button>
                <Button size="lg" onClick={handleCompleteRevision}>
                  <CheckCircle2 className="size-4 mr-2" />
                  Complete Revision
                </Button>
              </div>
            </Card>
          )}
        </>
      ) : (
        /* ================= COMPLETION SCREEN ================= */
        <Card className="p-8 sm:p-12 text-center space-y-6">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50 text-success dark:bg-emerald-950/40">
            <CheckCircle2 className="size-10" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Revision Logged Successfully!
            </h2>
            <p className="text-sm text-muted-foreground">
              {completionSummary?.cycleRestarted
                ? "Cycle restarted based on your assessment. Day 1 review will be ready tomorrow."
                : `Great job! Your next revision for this problem is scheduled for ${completionSummary?.nextRevisionText}.`}
            </p>
          </div>

          <div className="mx-auto max-w-sm rounded-xl border bg-muted/30 p-4 text-xs space-y-1 text-muted-foreground">
            <div>
              Problem: <strong className="text-foreground">{resolvedProblem.title}</strong>
            </div>
            <div>
              Status: <strong className="text-foreground">{completionSummary?.nextStatus}</strong>
            </div>
            <div>
              Next Review: <strong className="text-foreground">{completionSummary?.nextRevisionText}</strong>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
            {remainingDue.length > 0 ? (
              <Button
                size="lg"
                onClick={() => {
                  router.push(`/revisions/${remainingDue[0].id}`)
                  setStage(1)
                  setIsCompleted(false)
                  setSelectedRating(null)
                  setRecallScratchpad("")
                }}
              >
                Continue to Next Due ({remainingDue.length} left)
                <ArrowRight className="size-4 ml-2" />
              </Button>
            ) : (
              <Button size="lg" onClick={() => router.push("/revisions")}>
                View Revision Queue
              </Button>
            )}
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push(`/problems/${resolvedProblem.id}`)}
            >
              View Problem Details
            </Button>
          </div>
        </Card>
      )}

      {/* Exit Confirmation Dialog */}
      <Dialog open={exitDialogOpen} onOpenChange={setExitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Revision Session?</DialogTitle>
            <DialogDescription>
              You have completed recall and have an active revision in progress.
              If you leave now, this revision will not be logged.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setExitDialogOpen(false)}>
              Keep Revising
            </Button>
            <Button variant="destructive" onClick={confirmExit}>
              Exit Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

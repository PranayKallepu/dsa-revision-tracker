"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  ArrowLeft,
  BookOpen,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Edit3,
  ExternalLink,
  FileText,
  HelpCircle,
  History,
  Layers,
  Lightbulb,
  Plus,
  RotateCcw,
  Sparkles,
  Zap,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  toast,
} from "@/components/ui"
import { DifficultyBadge } from "@/components/shared/difficulty-badge"
import { useProblems } from "@/hooks/use-problems"
import { cn } from "@/lib/utils"
import {
  SPACE_COMPLEXITY_OPTIONS,
  TIME_COMPLEXITY_OPTIONS,
} from "../schema"
import type { Screen } from "@/types/navigation"
import type { Problem, SolutionType } from "@/types/problem"

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
  const { getProblemById, archiveProblem, restoreProblem, addSolution, refreshProblems } = useProblems()

  const resolvedProblem =
    propProblem || (problemId ? getProblemById(problemId) : undefined)

  // Add Solution Dialog State
  const [isAddSolutionOpen, setIsAddSolutionOpen] = useState(false)
  const [newSolutionType, setNewSolutionType] = useState<SolutionType>("OPTIMIZED")
  const [newApproach, setNewApproach] = useState("")
  const [newTimeComplexity, setNewTimeComplexity] = useState("")
  const [isNewCustomTime, setIsNewCustomTime] = useState(false)
  const [newCustomTime, setNewCustomTime] = useState("")
  const [newSpaceComplexity, setNewSpaceComplexity] = useState("")
  const [isNewCustomSpace, setIsNewCustomSpace] = useState(false)
  const [newCustomSpace, setNewCustomSpace] = useState("")
  const [newImprovementNotes, setNewImprovementNotes] = useState("")
  const [isSubmittingSolution, setIsSubmittingSolution] = useState(false)
  const [solutionError, setSolutionError] = useState("")

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
    } else if (resolvedProblem) {
      router.push(`/revisions/${resolvedProblem.id}`)
    }
  }

  const handleToggleArchive = () => {
    if (!resolvedProblem) return
    if (resolvedProblem.status === "Archived") {
      restoreProblem(resolvedProblem.id)
      toast.success("Problem restored to active queue")
    } else {
      archiveProblem(resolvedProblem.id)
      toast.success("Problem moved to archive")
    }
  }

  const handleOpenAddSolution = (type: SolutionType = "OPTIMIZED") => {
    setNewSolutionType(type)
    setNewApproach("")
    setNewTimeComplexity("")
    setIsNewCustomTime(false)
    setNewCustomTime("")
    setNewSpaceComplexity("")
    setIsNewCustomSpace(false)
    setNewCustomSpace("")
    setNewImprovementNotes("")
    setSolutionError("")
    setIsAddSolutionOpen(true)
  }

  const handleAddSolutionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resolvedProblem) return

    if (!newApproach.trim()) {
      setSolutionError("Approach explanation is required.")
      return
    }

    try {
      setIsSubmittingSolution(true)
      setSolutionError("")

      const finalTimeComplexity = isNewCustomTime ? newCustomTime : newTimeComplexity
      const finalSpaceComplexity = isNewCustomSpace ? newCustomSpace : newSpaceComplexity

      await addSolution(resolvedProblem.id, {
        solutionType: newSolutionType,
        approach: newApproach.trim(),
        timeComplexity: finalTimeComplexity || null,
        spaceComplexity: finalSpaceComplexity || null,
        improvementNotes: newImprovementNotes.trim() || null,
      })

      toast.success(
        resolvedProblem.solvingStatus === "NOT_SOLVED"
          ? "Problem marked as solved and added to revision queue!"
          : "New solution approach recorded successfully!",
      )

      setIsAddSolutionOpen(false)
      await refreshProblems()
    } catch (err) {
      setSolutionError(err instanceof Error ? err.message : "Failed to record solution")
    } finally {
      setIsSubmittingSolution(false)
    }
  }

  // Not-found state if invalid problem ID
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

  // Section 6 requirement: Remove "Added" status from timeline steps
  const steps = [
    { label: "Solved", day: 0 },
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
  const isUnsolved = resolvedProblem.solvingStatus === "NOT_SOLVED"

  return (
    <div className="space-y-6">
      {/* 1. Navigation & Actions Bar */}
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
          {isUnsolved ? (
            <Button
              size="sm"
              onClick={() => handleOpenAddSolution("BRUTE_FORCE")}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <CheckCircle2 className="size-4 mr-1.5" />
              Mark as Solved
            </Button>
          ) : (
            <Button size="sm" onClick={handleStartRevision} disabled={isArchived}>
              <RotateCcw className="size-4 mr-1.5" />
              Start Revision
            </Button>
          )}
        </div>
      </div>

      {/* Unsolved Backlog Notice Banner */}
      {isUnsolved && (
        <Card className="border-amber-500/30 bg-amber-500/10 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <HelpCircle className="size-6 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Problem in Unsolved Backlog
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This problem was attempted but not solved. It does not appear in Due Today or Overdue queues. When you solve it, record your solution to initiate its spaced revision schedule.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => handleOpenAddSolution("BRUTE_FORCE")}
              className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
            >
              <CheckCircle2 className="size-4 mr-1.5" />
              Record Solution
            </Button>
          </div>
        </Card>
      )}

      {/* Archive Notice Banner */}
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

      {/* 2. Main Hero Card */}
      <Card className="p-6 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
              <Code2 className="size-6" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <DifficultyBadge value={resolvedProblem.difficulty} />
                {isUnsolved ? (
                  <Badge tone="warning" className="gap-1 font-semibold">
                    <HelpCircle className="size-3" />
                    Unsolved Backlog
                  </Badge>
                ) : (
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
                )}
                <Badge tone="neutral">
                  {resolvedProblem.platform || "Platform"}
                </Badge>
                {resolvedProblem.time || resolvedProblem.timeSpentMinutes ? (
                  <Badge tone="neutral" className="gap-1">
                    <Clock className="size-3" />
                    {resolvedProblem.time || resolvedProblem.timeSpentMinutes} min spent attempting
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

      {/* 3. Detailed Sections Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* Left Column: Solutions / Blockers, Notes, Revisions & Attempts */}
        <div className="space-y-6">
          {/* Unsolved Blocker Information Card */}
          {isUnsolved && resolvedProblem.blockers && resolvedProblem.blockers.length > 0 && (
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2 font-bold text-foreground">
                <BookOpen className="size-5 text-amber-500" />
                <span>Unsolved Reflection & Learning Blockers</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {resolvedProblem.blockers[0].stuckPoint && (
                  <div className="rounded-xl border p-4 bg-muted/20">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Where you got stuck
                    </div>
                    <div className="text-sm mt-1 whitespace-pre-line text-foreground">
                      {resolvedProblem.blockers[0].stuckPoint}
                    </div>
                  </div>
                )}
                {resolvedProblem.blockers[0].approachesTried && (
                  <div className="rounded-xl border p-4 bg-muted/20">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Approaches tried
                    </div>
                    <div className="text-sm mt-1 whitespace-pre-line text-foreground">
                      {resolvedProblem.blockers[0].approachesTried}
                    </div>
                  </div>
                )}
                {resolvedProblem.blockers[0].conceptsToLearn && (
                  <div className="rounded-xl border p-4 bg-muted/20">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Concepts / patterns to learn
                    </div>
                    <div className="text-sm mt-1 whitespace-pre-line text-foreground">
                      {resolvedProblem.blockers[0].conceptsToLearn}
                    </div>
                  </div>
                )}
                {resolvedProblem.blockers[0].failureReason && (
                  <div className="rounded-xl border p-4 bg-muted/20">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Why it couldn't be solved
                    </div>
                    <div className="text-sm mt-1 whitespace-pre-line text-foreground">
                      {resolvedProblem.blockers[0].failureReason}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Solutions Card (Multiple approaches: Brute Force & Optimized) */}
          <Card className="p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Lightbulb className="size-5 text-primary" />
                <span>Solution Approaches</span>
                <Badge tone="neutral" className="text-xs">
                  {resolvedProblem.solutions && resolvedProblem.solutions.length > 0
                    ? resolvedProblem.solutions.length
                    : resolvedProblem.approach
                      ? 1
                      : 0}
                </Badge>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpenAddSolution("OPTIMIZED")}
                className="gap-1.5"
              >
                <Plus className="size-3.5" />
                <span>Add Another Solution</span>
              </Button>
            </div>

            {resolvedProblem.solutions && resolvedProblem.solutions.length > 0 ? (
              <div className="space-y-4">
                {resolvedProblem.solutions.map((sol, index) => (
                  <div
                    key={sol.id || index}
                    className="rounded-xl border p-4 bg-muted/10 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          tone={sol.solutionType === "OPTIMIZED" ? "success" : "warning"}
                          className="gap-1 font-semibold"
                        >
                          {sol.solutionType === "OPTIMIZED" ? (
                            <>
                              <Zap className="size-3" />
                              Optimized
                            </>
                          ) : (
                            <>
                              <Layers className="size-3" />
                              Brute Force
                            </>
                          )}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Approach #{index + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {sol.timeComplexity && (
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-secondary text-foreground">
                            Time: {sol.timeComplexity}
                          </span>
                        )}
                        {sol.spaceComplexity && (
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-secondary text-foreground">
                            Space: {sol.spaceComplexity}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                      {sol.approach}
                    </div>

                    {sol.improvementNotes && (
                      <div className="rounded-lg border border-primary/15 bg-primary/[0.03] p-3 text-xs text-muted-foreground">
                        <span className="font-semibold text-primary">Improvement Notes: </span>
                        {sol.improvementNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : resolvedProblem.approach ? (
              // Fallback for problems with single primary approach
              <div className="space-y-4">
                <div className="rounded-xl border p-4 bg-muted/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge tone="warning" className="gap-1 font-semibold">
                      <Layers className="size-3" />
                      Initial Approach
                    </Badge>
                  </div>
                  <div className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                    {resolvedProblem.approach}
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t pt-3">
                    <div className="text-xs">
                      <span className="text-muted-foreground">Time: </span>
                      <span className="font-mono font-bold">{resolvedProblem.timeComplexity || "—"}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">Space: </span>
                      <span className="font-mono font-bold">{resolvedProblem.spaceComplexity || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
                <p className="text-sm">No solution approaches recorded yet.</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() => handleOpenAddSolution("BRUTE_FORCE")}
                >
                  <Plus className="size-3.5 mr-1.5" />
                  Add Solution Approach
                </Button>
              </div>
            )}
          </Card>

          {/* Personal Notes & Gotchas */}
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

          {/* Revision History Card (Scheduled Learning Events) */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <CalendarCheck className="size-4 text-primary" />
                <h2>Revision History (Spaced Learning Events)</h2>
              </div>
              <span className="text-xs text-muted-foreground">
                {resolvedProblem.revisions?.length ?? 0} completed
              </span>
            </div>

            {resolvedProblem.revisions && resolvedProblem.revisions.length > 0 ? (
              <div className="space-y-3">
                {resolvedProblem.revisions.map((rev) => (
                  <div
                    key={rev.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3.5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary text-xs font-bold">
                        R{rev.revisionNumber}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          Revision #{rev.revisionNumber}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Scheduled: {rev.scheduledDate} · Completed: {rev.completionDate}
                          {rev.durationMinutes ? ` · ${rev.durationMinutes} min` : ""}
                        </div>
                      </div>
                    </div>
                    {rev.rating && (
                      <Badge
                        tone={
                          rev.rating === "Forgot"
                            ? "danger"
                            : rev.rating === "Difficult"
                              ? "warning"
                              : rev.rating === "Good"
                                ? "primary"
                                : "success"
                        }
                      >
                        {rev.rating}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
                <p className="text-sm">
                  {isUnsolved
                    ? "Unsolved problems do not have active revision cycles."
                    : "No completed revisions logged yet."}
                </p>
                {!isUnsolved && (
                  <p className="mt-1 text-xs">
                    Click "Start Revision" to begin active recall on this problem.
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* Attempt History Card (Solving Sessions) */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <History className="size-4 text-primary" />
                <h2>Attempt History (Solving Sessions)</h2>
              </div>
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
                          Attempt #{resolvedProblem.attempts!.length - i}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {attempt.date || attempt.createdDate} ·{" "}
                          {attempt.timeSpent || attempt.duration} min
                          {attempt.notes ? ` · "${attempt.notes}"` : ""}
                        </div>
                      </div>
                    </div>
                    {attempt.rating && (
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
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
                <p className="text-sm">No solving attempts logged yet.</p>
                <p className="mt-1 text-xs">
                  Solving durations entered during revisions will be preserved here.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Spaced Repetition Timeline & Mastery */}
        <div className="space-y-6">
          {/* Spaced Repetition Timeline */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-foreground">
                Spaced Repetition Schedule
              </h2>
              {isUnsolved ? (
                <Badge tone="warning" className="text-xs">
                  Backlog Inactive
                </Badge>
              ) : (
                <Badge tone="neutral" className="text-xs">
                  Stage {currentRevisionIndex} of {steps.length - 1}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-6">
              Next scheduled review:{" "}
              <strong className="text-foreground">
                {isUnsolved ? "Unsolved (Backlog)" : resolvedProblem.nextRevision}
              </strong>
            </p>

            {isUnsolved ? (
              <div className="rounded-xl border border-dashed p-5 text-center text-xs text-muted-foreground">
                <HelpCircle className="size-6 text-amber-500 mx-auto mb-2" />
                <p className="font-medium text-foreground">Revision scheduling is paused</p>
                <p className="mt-1">
                  Once you solve this problem, your first revision cycle will be scheduled automatically based on the solve date.
                </p>
              </div>
            ) : (
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
            )}
          </Card>

          {/* Mastery Unlock Card */}
          {!isUnsolved && (
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
          )}
        </div>
      </div>

      {/* Add Solution Approach Dialog */}
      <Dialog open={isAddSolutionOpen} onOpenChange={setIsAddSolutionOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isUnsolved ? "Record Solution & Mark as Solved" : "Add Solution Approach"}
            </DialogTitle>
            <DialogDescription>
              {isUnsolved
                ? "Recording a working solution will remove this problem from your Unsolved Backlog and schedule its first revision cycle."
                : "Add another solution approach (e.g. Optimized) to this problem without overwriting existing solutions."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSolutionSubmit} className="space-y-4 py-2">
            {solutionError && (
              <div className="p-3 text-xs rounded-lg bg-destructive/10 text-destructive font-medium">
                {solutionError}
              </div>
            )}

            {/* Solution Type Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Solution Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewSolutionType("BRUTE_FORCE")}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border p-3 text-left transition-all",
                    newSolutionType === "BRUTE_FORCE"
                      ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500"
                      : "border-border hover:bg-muted/40",
                  )}
                >
                  <Layers className="size-4 text-amber-500" />
                  <div>
                    <div className="text-xs font-semibold">Brute Force</div>
                    <div className="text-[10px] text-muted-foreground">Initial working approach</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setNewSolutionType("OPTIMIZED")}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border p-3 text-left transition-all",
                    newSolutionType === "OPTIMIZED"
                      ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500"
                      : "border-border hover:bg-muted/40",
                  )}
                >
                  <Zap className="size-4 text-emerald-500" />
                  <div>
                    <div className="text-xs font-semibold">Optimized</div>
                    <div className="text-[10px] text-muted-foreground">Optimal complexity</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Approach Explanation */}
            <div className="space-y-1.5">
              <Label htmlFor="dialog-approach" className="text-xs">
                Approach Explanation <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="dialog-approach"
                rows={4}
                placeholder="Explain the intuition, pointer movements, edge cases, or data structures used..."
                value={newApproach}
                onChange={(e) => setNewApproach(e.target.value)}
              />
            </div>

            {/* Complexities */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dialog-time" className="text-xs">Time Complexity</Label>
                <Select
                  value={isNewCustomTime ? "Other" : newTimeComplexity || "none"}
                  onValueChange={(val) => {
                    if (val === "Other") {
                      setIsNewCustomTime(true)
                      setNewTimeComplexity(newCustomTime)
                    } else if (val === "none") {
                      setIsNewCustomTime(false)
                      setNewTimeComplexity("")
                    } else {
                      setIsNewCustomTime(false)
                      setNewTimeComplexity(val)
                    }
                  }}
                >
                  <SelectTrigger id="dialog-time" className="text-xs">
                    <SelectValue placeholder="Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not specified</SelectItem>
                    {TIME_COMPLEXITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isNewCustomTime && (
                  <Input
                    className="mt-1 font-mono text-xs"
                    placeholder="e.g. O(n log n)"
                    value={newCustomTime}
                    onChange={(e) => {
                      setNewCustomTime(e.target.value)
                      setNewTimeComplexity(e.target.value)
                    }}
                    autoFocus
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dialog-space" className="text-xs">Space Complexity</Label>
                <Select
                  value={isNewCustomSpace ? "Other" : newSpaceComplexity || "none"}
                  onValueChange={(val) => {
                    if (val === "Other") {
                      setIsNewCustomSpace(true)
                      setNewSpaceComplexity(newCustomSpace)
                    } else if (val === "none") {
                      setIsNewCustomSpace(false)
                      setNewSpaceComplexity("")
                    } else {
                      setIsNewCustomSpace(false)
                      setNewSpaceComplexity(val)
                    }
                  }}
                >
                  <SelectTrigger id="dialog-space" className="text-xs">
                    <SelectValue placeholder="Space" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not specified</SelectItem>
                    {SPACE_COMPLEXITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isNewCustomSpace && (
                  <Input
                    className="mt-1 font-mono text-xs"
                    placeholder="e.g. O(1)"
                    value={newCustomSpace}
                    onChange={(e) => {
                      setNewCustomSpace(e.target.value)
                      setNewSpaceComplexity(e.target.value)
                    }}
                    autoFocus
                  />
                )}
              </div>
            </div>

            {/* Improvement Notes (Optional) */}
            <div className="space-y-1.5">
              <Label htmlFor="dialog-notes" className="text-xs">
                Improvement Notes <span className="text-[11px] text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="dialog-notes"
                rows={2}
                placeholder="What trade-offs or further optimizations exist? (Optional)..."
                value={newImprovementNotes}
                onChange={(e) => setNewImprovementNotes(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddSolutionOpen(false)}
                disabled={isSubmittingSolution}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmittingSolution}
                loading={isSubmittingSolution}
              >
                {isUnsolved ? "Save & Mark Solved" : "Save Solution"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

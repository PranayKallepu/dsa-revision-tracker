"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  FileText,
  HelpCircle,
  Layers,
  Lightbulb,
  Plus,
  Sparkles,
  X,
  Zap,
} from "lucide-react"
import {
  Badge,
  Button,
  Card,
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
import { useProblems } from "@/hooks/use-problems"
import { cn } from "@/lib/utils"
import {
  COMMON_TOPICS,
  derivePlatformFromUrl,
  DIFFICULTIES,
  PLATFORMS,
  problemFormSchema,
  type ProblemFormValues,
  TIME_COMPLEXITY_OPTIONS,
  SPACE_COMPLEXITY_OPTIONS,
} from "../schema"
import type { Difficulty, Platform, Problem, ProblemSolvingStatus, SolutionType } from "@/types/problem"
import type { Screen } from "@/types/navigation"

const isKnownTimePreset = (val: string) =>
  TIME_COMPLEXITY_OPTIONS.some((opt) => opt.value !== "Other" && opt.value === val)

const isKnownSpacePreset = (val: string) =>
  SPACE_COMPLEXITY_OPTIONS.some((opt) => opt.value !== "Other" && opt.value === val)

export interface ProblemFormProps {
  problemId?: string | number
  initialData?: Problem
  isEdit?: boolean
  addProblem?: (p: any) => any
  setScreen?: (s: Screen) => void
}

export function ProblemForm({
  problemId,
  initialData: propInitialData,
  isEdit = false,
  setScreen,
}: ProblemFormProps) {
  const router = useRouter()
  const { getProblemById, addProblem, updateProblem } = useProblems()

  const resolvedProblem =
    propInitialData ||
    (problemId ? getProblemById(problemId) : undefined)

  const isNotFound = isEdit && !resolvedProblem

  // Step A: Common fields
  const [title, setTitle] = useState(resolvedProblem?.title || "")
  const [url, setUrl] = useState(resolvedProblem?.url || "")
  const [platform, setPlatform] = useState<Platform | string>(
    resolvedProblem?.platform || "LeetCode",
  )
  const [difficulty, setDifficulty] = useState<Difficulty>(
    resolvedProblem?.difficulty || "Medium",
  )
  const [topics, setTopics] = useState<string[]>(
    resolvedProblem?.topics || ["Array"],
  )
  const [customTopicInput, setCustomTopicInput] = useState("")

  // Time spent: required manual duration entry (minutes)
  const [time, setTime] = useState<number | string>(
    resolvedProblem?.time !== undefined
      ? resolvedProblem.time
      : resolvedProblem?.timeSpentMinutes !== undefined && resolvedProblem.timeSpentMinutes !== null
        ? resolvedProblem.timeSpentMinutes
        : 30,
  )

  // Step B: Solving status
  const [solvingStatus, setSolvingStatus] = useState<ProblemSolvingStatus>(
    resolvedProblem?.solvingStatus || "SOLVED",
  )

  // Step C: Solved details
  const initialLatestSolution =
    resolvedProblem?.solutions && resolvedProblem.solutions.length > 0
      ? resolvedProblem.solutions[resolvedProblem.solutions.length - 1]
      : undefined

  const [solutionType, setSolutionType] = useState<SolutionType>(
    initialLatestSolution?.solutionType || "BRUTE_FORCE",
  )
  const [approach, setApproach] = useState(
    initialLatestSolution?.approach || resolvedProblem?.approach || "",
  )

  const initialTime =
    initialLatestSolution?.timeComplexity || resolvedProblem?.timeComplexity || ""
  const initialTimeIsCustom = Boolean(initialTime && !isKnownTimePreset(initialTime))
  const [timeComplexity, setTimeComplexity] = useState(initialTime)
  const [isCustomTime, setIsCustomTime] = useState(initialTimeIsCustom)
  const [customTime, setCustomTime] = useState(initialTimeIsCustom ? initialTime : "")

  const initialSpace =
    initialLatestSolution?.spaceComplexity || resolvedProblem?.spaceComplexity || ""
  const initialSpaceIsCustom = Boolean(initialSpace && !isKnownSpacePreset(initialSpace))
  const [spaceComplexity, setSpaceComplexity] = useState(initialSpace)
  const [isCustomSpace, setIsCustomSpace] = useState(initialSpaceIsCustom)
  const [customSpace, setCustomSpace] = useState(initialSpaceIsCustom ? initialSpace : "")

  const [improvementNotes, setImprovementNotes] = useState(
    initialLatestSolution?.improvementNotes || "",
  )
  const [notes, setNotes] = useState(resolvedProblem?.notes || "")
  const [mistakes, setMistakes] = useState(resolvedProblem?.mistakes || "")

  // Step D: Unsolved details
  const initialLatestBlocker =
    resolvedProblem?.blockers && resolvedProblem.blockers.length > 0
      ? resolvedProblem.blockers[0]
      : undefined

  const [stuckPoint, setStuckPoint] = useState(initialLatestBlocker?.stuckPoint || "")
  const [approachesTried, setApproachesTried] = useState(
    initialLatestBlocker?.approachesTried || "",
  )
  const [conceptsToLearn, setConceptsToLearn] = useState(
    initialLatestBlocker?.conceptsToLearn || "",
  )
  const [failureReason, setFailureReason] = useState(
    initialLatestBlocker?.failureReason || "",
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Populate data when resolvedProblem changes
  useEffect(() => {
    if (resolvedProblem && isEdit) {
      setTitle(resolvedProblem.title)
      setUrl(resolvedProblem.url)
      setPlatform(resolvedProblem.platform)
      setDifficulty(resolvedProblem.difficulty)
      setTopics(resolvedProblem.topics || [])
      setTime(
        resolvedProblem.time !== undefined
          ? resolvedProblem.time
          : resolvedProblem.timeSpentMinutes ?? 30,
      )
      setSolvingStatus(resolvedProblem.solvingStatus || "SOLVED")

      const latestSol =
        resolvedProblem.solutions && resolvedProblem.solutions.length > 0
          ? resolvedProblem.solutions[resolvedProblem.solutions.length - 1]
          : undefined

      if (latestSol) {
        setSolutionType(latestSol.solutionType)
        setApproach(latestSol.approach || "")
        const tVal = latestSol.timeComplexity || ""
        const tCustom = Boolean(tVal && !isKnownTimePreset(tVal))
        setTimeComplexity(tVal)
        setIsCustomTime(tCustom)
        setCustomTime(tCustom ? tVal : "")

        const sVal = latestSol.spaceComplexity || ""
        const sCustom = Boolean(sVal && !isKnownSpacePreset(sVal))
        setSpaceComplexity(sVal)
        setIsCustomSpace(sCustom)
        setCustomSpace(sCustom ? sVal : "")
        setImprovementNotes(latestSol.improvementNotes || "")
      } else {
        setApproach(resolvedProblem.approach || "")
        const tVal = resolvedProblem.timeComplexity || ""
        const tCustom = Boolean(tVal && !isKnownTimePreset(tVal))
        setTimeComplexity(tVal)
        setIsCustomTime(tCustom)
        setCustomTime(tCustom ? tVal : "")

        const sVal = resolvedProblem.spaceComplexity || ""
        const sCustom = Boolean(sVal && !isKnownSpacePreset(sVal))
        setSpaceComplexity(sVal)
        setIsCustomSpace(sCustom)
        setCustomSpace(sCustom ? sVal : "")
      }

      const latestBlk =
        resolvedProblem.blockers && resolvedProblem.blockers.length > 0
          ? resolvedProblem.blockers[0]
          : undefined

      if (latestBlk) {
        setStuckPoint(latestBlk.stuckPoint || "")
        setApproachesTried(latestBlk.approachesTried || "")
        setConceptsToLearn(latestBlk.conceptsToLearn || "")
        setFailureReason(latestBlk.failureReason || "")
      }

      setNotes(resolvedProblem.notes || "")
      setMistakes(resolvedProblem.mistakes || "")
    }
  }, [resolvedProblem, isEdit])

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl)
    if (errors.url) {
      setErrors((prev) => ({ ...prev, url: "" }))
    }
    const detected = derivePlatformFromUrl(newUrl)
    if (detected) {
      setPlatform(detected)
    }
  }

  const addTopicTag = (tag: string) => {
    const trimmed = tag.trim()
    if (!trimmed) return
    if (!topics.includes(trimmed)) {
      setTopics((prev) => [...prev, trimmed])
      if (errors.topics) {
        setErrors((prev) => ({ ...prev, topics: "" }))
      }
    }
    setCustomTopicInput("")
  }

  const removeTopicTag = (tag: string) => {
    setTopics((prev) => prev.filter((t) => t !== tag))
  }

  const handleBack = () => {
    if (setScreen) {
      setScreen("problems")
    } else if (isEdit && resolvedProblem) {
      router.push(`/problems/${resolvedProblem.id}`)
    } else {
      router.push("/problems")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const durationNum = Number(time)
    if (isNaN(durationNum) || durationNum <= 0) {
      setErrors({ time: "Time spent is required and must be greater than 0 minutes" })
      toast.error("Time spent must be greater than 0 minutes.")
      setIsSubmitting(false)
      return
    }

    const rawValues: ProblemFormValues = {
      title,
      url,
      platform,
      difficulty,
      topics,
      time: durationNum,
      solvingStatus,
      solutionType,
      approach,
      timeComplexity: isCustomTime ? customTime : timeComplexity,
      spaceComplexity: isCustomSpace ? customSpace : spaceComplexity,
      improvementNotes,
      notes,
      mistakes,
      stuckPoint,
      approachesTried,
      conceptsToLearn,
      failureReason,
    }

    const validation = problemFormSchema.safeParse(rawValues)

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of validation.error.issues) {
        const fieldName = issue.path[0] as string
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message
        }
      }
      setErrors(fieldErrors)
      toast.error(
        validation.error.issues[0]?.message || "Please fill in all required fields correctly.",
      )
      setIsSubmitting(false)
      return
    }

    const validData = validation.data
    const timeSpentSeconds = Math.round(validData.time * 60)

    try {
      if (validData.solvingStatus === "SOLVED") {
        const solutionPayload = {
          solutionType: validData.solutionType || "BRUTE_FORCE",
          approach: validData.approach,
          timeComplexity: validData.timeComplexity || null,
          spaceComplexity: validData.spaceComplexity || null,
          improvementNotes: validData.improvementNotes || null,
        }

        if (isEdit && resolvedProblem) {
          await updateProblem(resolvedProblem.id, {
            title: validData.title,
            url: validData.url,
            platform: validData.platform,
            difficulty: validData.difficulty,
            topics: validData.topics,
            timeSpentSeconds,
            time: validData.time,
            solvingStatus: "SOLVED",
            solution: solutionPayload,
            approach: validData.approach,
            timeComplexity: validData.timeComplexity,
            spaceComplexity: validData.spaceComplexity,
            notes: validData.notes,
            mistakes: validData.mistakes,
          })

          toast.success("Problem updated successfully")
          if (setScreen) {
            setScreen("problems")
          } else {
            router.push(`/problems/${resolvedProblem.id}`)
          }
        } else {
          const created = await addProblem({
            title: validData.title,
            url: validData.url,
            platform: validData.platform,
            difficulty: validData.difficulty,
            topics: validData.topics,
            timeSpentSeconds,
            time: validData.time,
            solvingStatus: "SOLVED",
            solution: solutionPayload,
            approach: validData.approach,
            timeComplexity: validData.timeComplexity,
            spaceComplexity: validData.spaceComplexity,
            notes: validData.notes,
            mistakes: validData.mistakes,
            status: "Learning",
            nextRevision: "Today",
            revision: 0,
            attempts: [],
          })

          toast.success("Solved problem recorded successfully")
          if (setScreen) {
            setScreen("problems")
          } else if (created && created.id) {
            router.push(`/problems/${created.id}`)
          } else {
            router.push("/problems")
          }
        }
      } else {
        // NOT_SOLVED problem
        const blockerPayload = {
          stuckPoint: validData.stuckPoint || null,
          approachesTried: validData.approachesTried || null,
          conceptsToLearn: validData.conceptsToLearn || null,
          failureReason: validData.failureReason || null,
        }

        if (isEdit && resolvedProblem) {
          await updateProblem(resolvedProblem.id, {
            title: validData.title,
            url: validData.url,
            platform: validData.platform,
            difficulty: validData.difficulty,
            topics: validData.topics,
            timeSpentSeconds,
            time: validData.time,
            solvingStatus: "NOT_SOLVED",
            blocker: blockerPayload,
            notes: validData.notes,
            mistakes: validData.mistakes,
          })

          toast.success("Unsolved problem updated in backlog")
          if (setScreen) {
            setScreen("problems")
          } else {
            router.push(`/problems/${resolvedProblem.id}`)
          }
        } else {
          const created = await addProblem({
            title: validData.title,
            url: validData.url,
            platform: validData.platform,
            difficulty: validData.difficulty,
            topics: validData.topics,
            timeSpentSeconds,
            time: validData.time,
            solvingStatus: "NOT_SOLVED",
            blocker: blockerPayload,
            status: "Learning",
            nextRevision: "Unsolved",
            revision: 0,
            attempts: [],
          })

          toast.success("Problem saved to Unsolved Backlog")
          if (setScreen) {
            setScreen("problems")
          } else if (created && created.id) {
            router.push(`/problems/${created.id}`)
          } else {
            router.push("/problems")
          }
        }
      }
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Failed to save problem" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isNotFound) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle className="size-6" />
        </div>
        <h2 className="mt-4 text-xl font-bold">Problem Not Found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The problem you are trying to edit does not exist or may have been removed.
        </p>
        <div className="mt-6">
          <Button onClick={handleBack}>
            <ArrowLeft className="size-4 mr-2" />
            Back to Problems
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
      {/* Header & Back Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleBack}
            aria-label="Back"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {isEdit ? "Edit Problem" : "Record Problem Attempt"}
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {isEdit
                ? `Update details and learning records for #${resolvedProblem?.id}`
                : "Record your external platform attempt, whether solved or unsolved."}
            </p>
          </div>
        </div>
      </div>

      {errors.form && (
        <Card className="border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive font-medium">
          {errors.form}
        </Card>
      )}

      {/* Step A: Basic Details */}
      <Card className="p-5 sm:p-7">
        <div className="mb-6 flex items-center gap-3 border-b pb-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
            <Code2 className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground sm:text-lg">
              Basic Details
            </h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Identify the problem title, URL, platform, topics, and duration spent.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Title Field */}
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="problem-title">
              Problem title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="problem-title"
              placeholder="e.g. Longest Substring Without Repeating Characters"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (errors.title) setErrors((prev) => ({ ...prev, title: "" }))
              }}
              className={errors.title ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.title && (
              <p className="text-xs text-destructive font-medium mt-1">{errors.title}</p>
            )}
          </div>

          {/* URL Field */}
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="problem-url">
              Problem URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="problem-url"
              placeholder="https://leetcode.com/problems/..."
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              className={errors.url ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.url ? (
              <p className="text-xs text-destructive font-medium mt-1">{errors.url}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Platform is automatically detected from popular domains like LeetCode and GFG.
              </p>
            )}
          </div>

          {/* Platform Field */}
          <div className="space-y-1.5">
            <Label htmlFor="platform-select">Platform</Label>
            <Select
              value={platform}
              onValueChange={(val) => {
                setPlatform(val)
                if (errors.platform) setErrors((prev) => ({ ...prev, platform: "" }))
              }}
            >
              <SelectTrigger id="platform-select">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((plat) => (
                  <SelectItem key={plat} value={plat}>
                    {plat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.platform && (
              <p className="text-xs text-destructive font-medium mt-1">{errors.platform}</p>
            )}
          </div>

          {/* Difficulty Field */}
          <div className="space-y-1.5">
            <Label htmlFor="difficulty-select">Difficulty</Label>
            <Select
              value={difficulty}
              onValueChange={(val: Difficulty) => {
                setDifficulty(val)
                if (errors.difficulty) setErrors((prev) => ({ ...prev, difficulty: "" }))
              }}
            >
              <SelectTrigger id="difficulty-select">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map((diff) => (
                  <SelectItem key={diff} value={diff}>
                    {diff}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.difficulty && (
              <p className="text-xs text-destructive font-medium mt-1">{errors.difficulty}</p>
            )}
          </div>

          {/* Time Spent Field (Required positive value) */}
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="solving-time">
              Time Spent Attempting (minutes) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="solving-time"
                type="number"
                min="1"
                max="1440"
                placeholder="e.g. 30"
                value={time}
                onChange={(e) => {
                  setTime(e.target.value)
                  if (errors.time) setErrors((prev) => ({ ...prev, time: "" }))
                }}
                className={errors.time ? "border-destructive pl-8" : "pl-8"}
              />
              <Clock className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            </div>
            {errors.time ? (
              <p className="text-xs text-destructive font-medium mt-1">{errors.time}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Total time you spent on this problem, whether you solved it or got stuck.
              </p>
            )}
          </div>

          {/* Topics Field */}
          <div className="sm:col-span-2 space-y-2">
            <Label>
              Topics & Patterns <span className="text-destructive">*</span>
            </Label>

            {/* Active Selected Tags */}
            <div className="flex flex-wrap items-center gap-1.5 min-h-[38px] p-2 border rounded-md bg-background">
              {topics.length === 0 ? (
                <span className="text-xs text-muted-foreground">
                  No topics selected yet. Pick from recommendations below or add custom.
                </span>
              ) : (
                topics.map((t) => (
                  <Badge key={t} tone="primary" className="gap-1 pl-2.5 pr-1.5 py-1 text-xs">
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => removeTopicTag(t)}
                      className="rounded-full hover:bg-primary/20 p-0.5"
                      aria-label={`Remove topic ${t}`}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>

            {/* Custom Topic Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Type a custom topic tag..."
                value={customTopicInput}
                onChange={(e) => setCustomTopicInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTopicTag(customTopicInput)
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addTopicTag(customTopicInput)}
                disabled={!customTopicInput.trim()}
              >
                <Plus className="size-4 mr-1" />
                Add Tag
              </Button>
            </div>

            {/* Recommended Topic Suggestions */}
            <div className="mt-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Quick Add:
              </span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {COMMON_TOPICS.filter((t) => !topics.includes(t))
                  .slice(0, 10)
                  .map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => addTopicTag(t)}
                      className="inline-flex items-center rounded-md border border-dashed px-2 py-0.5 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      + {t}
                    </button>
                  ))}
              </div>
            </div>

            {errors.topics && (
              <p className="text-xs text-destructive font-medium mt-1">{errors.topics}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Step B: Solving Status Selector */}
      <Card className="p-5 sm:p-7">
        <div className="mb-4">
          <Label className="text-base font-bold text-foreground">
            Did you solve this problem? <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tell us whether you completed a working solution or need to review it in your Unsolved Backlog.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setSolvingStatus("SOLVED")}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
              solvingStatus === "SOLVED"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border hover:bg-muted/50",
            )}
          >
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg",
                solvingStatus === "SOLVED"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <div className="font-semibold text-foreground text-sm">Solved</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                I successfully completed a working solution. (Brute Force or Optimized).
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSolvingStatus("NOT_SOLVED")}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
              solvingStatus === "NOT_SOLVED"
                ? "border-amber-500 bg-amber-500/5 ring-2 ring-amber-500/20"
                : "border-border hover:bg-muted/50",
            )}
          >
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg",
                solvingStatus === "NOT_SOLVED"
                  ? "bg-amber-500 text-white"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <HelpCircle className="size-5" />
            </div>
            <div>
              <div className="font-semibold text-foreground text-sm">Not Solved</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                I got stuck or couldn't finish. Save to Unsolved Backlog without revision scheduling.
              </p>
            </div>
          </button>
        </div>
      </Card>

      {/* Step C: If Solved -> Solution Details */}
      {solvingStatus === "SOLVED" && (
        <Card className="p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-3 border-b pb-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
              <Lightbulb className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground sm:text-lg">
                Solution Details & Complexity
              </h2>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Document how you solved it, your algorithmic approach, and Big-O complexities.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Solution Type: Brute Force vs Optimized */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">How did you solve it?</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setSolutionType("BRUTE_FORCE")}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
                    solutionType === "BRUTE_FORCE"
                      ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500"
                      : "border-border hover:bg-muted/40",
                  )}
                >
                  <Layers className="size-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm">Brute Force</div>
                    <p className="text-xs text-muted-foreground">
                      Initial working approach. You can add an optimized solution later.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSolutionType("OPTIMIZED")}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
                    solutionType === "OPTIMIZED"
                      ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500"
                      : "border-border hover:bg-muted/40",
                  )}
                >
                  <Zap className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm">Optimized</div>
                    <p className="text-xs text-muted-foreground">
                      Optimal time and space complexity solution.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Approach Textarea (Required) */}
            <div className="space-y-1.5">
              <Label htmlFor="approach-input">
                Approach Explanation <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="approach-input"
                rows={4}
                placeholder="Explain the intuition, pointer movements, edge conditions, data structure chosen, or recurrence relation..."
                value={approach}
                onChange={(e) => {
                  setApproach(e.target.value)
                  if (errors.approach) setErrors((prev) => ({ ...prev, approach: "" }))
                }}
                className={errors.approach ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.approach && (
                <p className="text-xs text-destructive font-medium mt-1">{errors.approach}</p>
              )}
            </div>

            {/* Complexities */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="time-complexity">Time Complexity</Label>
                <Select
                  value={isCustomTime ? "Other" : timeComplexity || "none"}
                  onValueChange={(val) => {
                    if (val === "Other") {
                      setIsCustomTime(true)
                      setTimeComplexity(customTime)
                    } else if (val === "none") {
                      setIsCustomTime(false)
                      setTimeComplexity("")
                    } else {
                      setIsCustomTime(false)
                      setTimeComplexity(val)
                    }
                  }}
                >
                  <SelectTrigger id="time-complexity">
                    <SelectValue placeholder="Select Time Complexity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="text-muted-foreground">Not specified</span>
                    </SelectItem>
                    {TIME_COMPLEXITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isCustomTime && (
                  <Input
                    className="mt-2 font-mono text-xs"
                    placeholder="e.g. O(min(n, m)) or O(k)"
                    value={customTime}
                    onChange={(e) => {
                      setCustomTime(e.target.value)
                      setTimeComplexity(e.target.value)
                    }}
                    autoFocus
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="space-complexity">Space Complexity</Label>
                <Select
                  value={isCustomSpace ? "Other" : spaceComplexity || "none"}
                  onValueChange={(val) => {
                    if (val === "Other") {
                      setIsCustomSpace(true)
                      setSpaceComplexity(customSpace)
                    } else if (val === "none") {
                      setIsCustomSpace(false)
                      setSpaceComplexity("")
                    } else {
                      setIsCustomSpace(false)
                      setSpaceComplexity(val)
                    }
                  }}
                >
                  <SelectTrigger id="space-complexity">
                    <SelectValue placeholder="Select Space Complexity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="text-muted-foreground">Not specified</span>
                    </SelectItem>
                    {SPACE_COMPLEXITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isCustomSpace && (
                  <Input
                    className="mt-2 font-mono text-xs"
                    placeholder="e.g. O(k) or O(V + E)"
                    value={customSpace}
                    onChange={(e) => {
                      setCustomSpace(e.target.value)
                      setSpaceComplexity(e.target.value)
                    }}
                    autoFocus
                  />
                )}
              </div>
            </div>

            {/* Improvement Notes (Optional) */}
            <div className="space-y-1.5">
              <Label htmlFor="improvement-notes">
                Improvement Notes <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="improvement-notes"
                rows={3}
                placeholder="What bottlenecks remain? What can be optimized further? (Optional, especially helpful for brute force)..."
                value={improvementNotes}
                onChange={(e) => setImprovementNotes(e.target.value)}
              />
            </div>

            {/* Personal Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="personal-notes">
                Personal Notes & Insights <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="personal-notes"
                rows={3}
                placeholder="Key observations, alternative patterns, edge cases to keep in mind..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Mistakes Made */}
            <div className="space-y-1.5">
              <Label htmlFor="mistakes-made">
                Mistakes Made / Pitfalls <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="mistakes-made"
                rows={3}
                placeholder="What went wrong on the first attempt? (e.g. Integer overflow, off-by-one, forgot base case)..."
                value={mistakes}
                onChange={(e) => setMistakes(e.target.value)}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Step D: If Not Solved -> Unsolved Learning & Reflection Section */}
      {solvingStatus === "NOT_SOLVED" && (
        <Card className="border-amber-500/30 bg-amber-500/[0.02] p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-3 border-b border-amber-500/20 pb-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <BookOpen className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground sm:text-lg">
                Unsolved Learning & Reflection
              </h2>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Document what blocked you. This problem will be added to your Unsolved Backlog without scheduled revisions.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Where did you get stuck? */}
            <div className="space-y-1.5">
              <Label htmlFor="stuck-point">Where did you get stuck?</Label>
              <Textarea
                id="stuck-point"
                rows={3}
                placeholder="e.g. Could not formulate the dynamic programming state transition; struggled to handle disjoint set cycle detection..."
                value={stuckPoint}
                onChange={(e) => setStuckPoint(e.target.value)}
              />
            </div>

            {/* What approaches did you try? */}
            <div className="space-y-1.5">
              <Label htmlFor="approaches-tried">What approaches did you try?</Label>
              <Textarea
                id="approaches-tried"
                rows={3}
                placeholder="e.g. Tried a greedy approach sorting by end time; tried standard BFS but hit memory limits on large graphs..."
                value={approachesTried}
                onChange={(e) => setApproachesTried(e.target.value)}
              />
            </div>

            {/* What concepts or patterns do you need to learn? */}
            <div className="space-y-1.5">
              <Label htmlFor="concepts-to-learn">What concepts or patterns do you need to learn?</Label>
              <Textarea
                id="concepts-to-learn"
                rows={3}
                placeholder="e.g. Monotonic deque for sliding window minimum; Dijkstra with priority queue; binary lifting..."
                value={conceptsToLearn}
                onChange={(e) => setConceptsToLearn(e.target.value)}
              />
            </div>

            {/* Why couldn't you solve it? */}
            <div className="space-y-1.5">
              <Label htmlFor="failure-reason">Why couldn't you solve it?</Label>
              <Textarea
                id="failure-reason"
                rows={3}
                placeholder="e.g. Ran out of time during attempt; missed an edge case with negative weights; didn't recognize problem reduction..."
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
          {!isSubmitting && <Check className="size-4 mr-1.5" />}
          {isEdit
            ? "Update Problem"
            : solvingStatus === "SOLVED"
              ? "Save Solved Problem"
              : "Save to Unsolved Backlog"}
        </Button>
      </div>
    </form>
  )
}

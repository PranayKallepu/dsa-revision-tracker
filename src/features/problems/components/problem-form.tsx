"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clock,
  Code2,
  FileText,
  Lightbulb,
  Plus,
  Sparkles,
  X,
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
} from "@/components/ui"
import { useProblems } from "@/hooks/use-problems"
import {
  COMMON_TOPICS,
  derivePlatformFromUrl,
  DIFFICULTIES,
  PLATFORMS,
  problemFormSchema,
  type ProblemFormValues,
} from "../schema"
import type { Difficulty, Platform, Problem } from "@/types/problem"
import type { Screen } from "@/types/navigation"

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
  const isNotFound =
    isEdit &&
    !resolvedProblem
  const [title, setTitle] = useState(
    resolvedProblem?.title ||
      "",
  )
  const [url, setUrl] = useState(
    resolvedProblem?.url ||
      "",
  )
  const [platform, setPlatform] = useState<Platform | string>(
    resolvedProblem?.platform ||
      "LeetCode",
  )
  const [difficulty, setDifficulty] = useState<Difficulty>(
    resolvedProblem?.difficulty ||
      "Medium",
  )
  const [topics, setTopics] = useState<string[]>(
    resolvedProblem?.topics || ["Array"],
  )
  const [customTopicInput, setCustomTopicInput] = useState("")
  const [time, setTime] = useState<number | string>(
    resolvedProblem?.time !==
      undefined
      ? resolvedProblem.time
      : 30,
  )
  const [approach, setApproach] = useState(
    resolvedProblem?.approach ||
      "",
  )
  const [timeComplexity, setTimeComplexity] = useState(
    resolvedProblem?.timeComplexity ||
      "",
  )
  const [spaceComplexity, setSpaceComplexity] = useState(
    resolvedProblem?.spaceComplexity ||
      "",
  )
  const [notes, setNotes] = useState(
    resolvedProblem?.notes ||
      "",
  )
  const [mistakes, setMistakes] = useState(
    resolvedProblem?.mistakes ||
      "",
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  useEffect(() => {
    if (resolvedProblem && isEdit) {
      setTitle(resolvedProblem.title)
      setUrl(resolvedProblem.url)
      setPlatform(resolvedProblem.platform)
      setDifficulty(resolvedProblem.difficulty)
      setTopics(
        resolvedProblem.topics ||
          [],
      )
      setTime(
        resolvedProblem.time ??
          30,
      )
      setApproach(
        resolvedProblem.approach ||
          "",
      )
      setTimeComplexity(
        resolvedProblem.timeComplexity ||
          "",
      )
      setSpaceComplexity(
        resolvedProblem.spaceComplexity ||
          "",
      )
      setNotes(
        resolvedProblem.notes ||
          "",
      )
      setMistakes(
        resolvedProblem.mistakes ||
          "",
      )
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
    setTopics((prev) =>
      prev.filter(
        (t) =>
          t !==
          tag,
      ),
    )
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

    const rawValues: ProblemFormValues = {
      title,
      url,
      platform,
      difficulty,
      topics,
      time:
        Number(time) ||
        0,
      approach,
      timeComplexity,
      spaceComplexity,
      notes,
      mistakes,
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
      setIsSubmitting(false)
      return
    }

    const validData = validation.data

    try {
      if (isEdit && resolvedProblem) {
        await updateProblem(resolvedProblem.id, {
          title: validData.title,
          url: validData.url,
          platform: validData.platform,
          difficulty: validData.difficulty,
          topics: validData.topics,
          time: validData.time,
          approach: validData.approach,
          timeComplexity: validData.timeComplexity,
          spaceComplexity: validData.spaceComplexity,
          notes: validData.notes,
          mistakes: validData.mistakes,
        })

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
          time: validData.time,
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

        if (setScreen) {
          setScreen("problems")
        } else if (created && created.id) {
          router.push(`/problems/${created.id}`)
        } else {
          router.push("/problems")
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
          The problem you are trying to edit does not exist or may have been
          removed.
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
              {isEdit ? "Edit Problem" : "Add Problem"}
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {isEdit
                ? `Update details and revision parameters for #${resolvedProblem?.id}`
                : "Record problem metadata, logic, complexity, and reflection notes."}
            </p>
          </div>
        </div>
      </div>

      {errors.form && (
        <Card className="border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive font-medium">
          {errors.form}
        </Card>
      )}

      {/* Section 1: Problem Information */}
      <Card className="p-5 sm:p-7">
        <div className="mb-6 flex items-center gap-3 border-b pb-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
            <Code2 className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground sm:text-lg">
              Problem Information
            </h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Classify the problem source, difficulty, and algorithmic topics.
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
              className={
                errors.title
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
            />
            {errors.title && (
              <p className="text-xs text-destructive font-medium mt-1">
                {errors.title}
              </p>
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
              className={
                errors.url
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
            />
            {errors.url ? (
              <p className="text-xs text-destructive font-medium mt-1">
                {errors.url}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Platform is automatically detected from popular domains like
                LeetCode and GFG.
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
                if (errors.platform)
                  setErrors((prev) => ({ ...prev, platform: "" }))
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
              <p className="text-xs text-destructive font-medium mt-1">
                {errors.platform}
              </p>
            )}
          </div>

          {/* Difficulty Field */}
          <div className="space-y-1.5">
            <Label htmlFor="difficulty-select">Difficulty</Label>
            <Select
              value={difficulty}
              onValueChange={(val: Difficulty) => {
                setDifficulty(val)
                if (errors.difficulty)
                  setErrors((prev) => ({ ...prev, difficulty: "" }))
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
              <p className="text-xs text-destructive font-medium mt-1">
                {errors.difficulty}
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
                  No topics selected yet. Pick from recommendations below or add
                  custom.
                </span>
              ) : (
                topics.map((t) => (
                  <Badge
                    key={t}
                    tone="primary"
                    className="gap-1 pl-2.5 pr-1.5 py-1 text-xs"
                  >
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
              <p className="text-xs text-destructive font-medium mt-1">
                {errors.topics}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Section 2: Complexity & Solution Reflection */}
      <Card className="p-5 sm:p-7">
        <div className="mb-6 flex items-center gap-3 border-b pb-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
            <Lightbulb className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground sm:text-lg">
              Solution Reflection & Complexity
            </h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Document algorithmic intuition, big-O metrics, and personal
              learnings.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Approach Textarea */}
          <div className="space-y-1.5">
            <Label htmlFor="approach-input">Approach / Solution Logic</Label>
            <Textarea
              id="approach-input"
              rows={4}
              placeholder="Explain the intuition, pointer movements, edge conditions, or recurrence relations..."
              value={approach}
              onChange={(e) => setApproach(e.target.value)}
            />
          </div>

          {/* Complexities and Solving Duration */}
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="time-complexity">Time Complexity</Label>
              <Input
                id="time-complexity"
                placeholder="e.g. O(n log n)"
                value={timeComplexity}
                onChange={(e) => setTimeComplexity(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="space-complexity">Space Complexity</Label>
              <Input
                id="space-complexity"
                placeholder="e.g. O(1) or O(n)"
                value={spaceComplexity}
                onChange={(e) => setSpaceComplexity(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="solving-time">Initial Solving Time (mins)</Label>
              <div className="relative">
                <Input
                  id="solving-time"
                  type="number"
                  min="0"
                  max="1440"
                  placeholder="30"
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value)
                    if (errors.time)
                      setErrors((prev) => ({ ...prev, time: "" }))
                  }}
                  className={errors.time ? "border-destructive pl-8" : "pl-8"}
                />
                <Clock className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              </div>
              {errors.time && (
                <p className="text-xs text-destructive font-medium mt-1">
                  {errors.time}
                </p>
              )}
            </div>
          </div>

          {/* Personal Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="personal-notes">Personal Notes & Insights</Label>
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
            <Label htmlFor="mistakes-made">Mistakes Made / Pitfalls</Label>
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
        <Button type="submit" disabled={isSubmitting}>
          <Check className="size-4 mr-1.5" />
          {isEdit ? "Update Problem" : "Save Problem"}
        </Button>
      </div>
    </form>
  )
}

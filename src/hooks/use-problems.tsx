"use client"

import * as React from "react"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import {
  calculateNextRevision,
  type NextRevisionSchedule,
} from "@/features/revisions/utils/scheduling"
import type { Attempt, Problem, Revision, RevisionRating } from "@/types"

export interface CompleteRevisionInput {
  rating: RevisionRating
  durationMinutes?: number
  notes?: string
}

export interface CompleteRevisionResult {
  updatedProblem: Problem
  nextSchedule: NextRevisionSchedule
}

interface ProblemsContextType {
  items: Problem[]
  setItems: React.Dispatch<React.SetStateAction<Problem[]>>
  isLoading: boolean
  error: string | null
  refreshProblems: () => Promise<void>
  addProblem: (problem: Omit<Problem, "id"> | Problem) => Promise<Problem>
  updateProblem: (id: number | string, data: Partial<Problem>) => Promise<Problem | null>
  archiveProblem: (id: number | string) => Promise<void>
  restoreProblem: (id: number | string) => Promise<void>
  getProblemById: (id: number | string) => Problem | undefined
  completeRevision: (
    problemId: number | string,
    data: CompleteRevisionInput,
  ) => CompleteRevisionResult | null
  getDueRevisions: () => Problem[]
  getOverdueRevisions: () => Problem[]
}

const ProblemsContext = createContext<ProblemsContextType | null>(null)

export function ProblemsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Problem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch problems from the PostgreSQL REST API endpoint
  const fetchProblems = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch("/api/problems?limit=100&sortBy=createdAt&sortOrder=desc")

      if (!res.ok) {
        if (res.status === 401) {
          // Unauthenticated: clear items, not a crash error
          setItems([])
          return
        }
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson?.error?.message || `Failed to fetch problems (${res.status})`)
      }

      const json = await res.json()
      if (json.success && json.data?.items) {
        setItems(json.data.items)
      } else if (Array.isArray(json.data)) {
        setItems(json.data)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load problems"
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchProblems()
  }, [fetchProblems])

  const addProblem = async (problemData: Omit<Problem, "id"> | Problem): Promise<Problem> => {
    try {
      const payload = {
        title: problemData.title,
        url: problemData.url,
        platform: problemData.platform,
        difficulty: problemData.difficulty,
        topics: problemData.topics || [],
        status: problemData.status,
        approach: problemData.approach,
        timeComplexity: problemData.timeComplexity,
        spaceComplexity: problemData.spaceComplexity,
        notes: problemData.notes,
        mistakes: problemData.mistakes,
        time: problemData.time,
        initialSolveDurationSeconds: problemData.initialSolveDurationSeconds,
      }

      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok || !json.success) {
        const errorMsg =
          json?.error?.details?.[0]?.message ||
          json?.error?.message ||
          "Failed to create problem on server"
        throw new Error(errorMsg)
      }

      const created: Problem = json.data
      setItems((prev) => [created, ...prev])
      return created
    } catch (err) {
      throw err
    }
  }

  const updateProblem = async (
    id: number | string,
    data: Partial<Problem>,
  ): Promise<Problem | null> => {
    try {
      const payload = {
        title: data.title,
        url: data.url,
        platform: data.platform,
        difficulty: data.difficulty,
        topics: data.topics,
        status: data.status,
        approach: data.approach,
        timeComplexity: data.timeComplexity,
        spaceComplexity: data.spaceComplexity,
        notes: data.notes,
        mistakes: data.mistakes,
        time: data.time,
        initialSolveDurationSeconds: data.initialSolveDurationSeconds,
      }

      const res = await fetch(`/api/problems/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok || !json.success) {
        const errorMsg =
          json?.error?.details?.[0]?.message ||
          json?.error?.message ||
          "Failed to update problem on server"
        throw new Error(errorMsg)
      }

      const updated: Problem = json.data
      setItems((prev) =>
        prev.map((item) => (String(item.id) === String(id) ? updated : item)),
      )
      return updated
    } catch (err) {
      throw err
    }
  }

  const archiveProblem = async (id: number | string) => {
    try {
      const res = await fetch(`/api/problems/${id}/archive`, {
        method: "PATCH",
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || "Failed to archive problem")
      }

      const updated: Problem = json.data
      setItems((prev) =>
        prev.map((item) => (String(item.id) === String(id) ? updated : item)),
      )
    } catch (err) {
      // Optimistic update fallback
      setItems((prev) =>
        prev.map((p) =>
          String(p.id) === String(id)
            ? {
                ...p,
                status: "Archived" as const,
                nextRevision: "—",
                updatedAt: new Date().toISOString(),
              }
            : p,
        ),
      )
      throw err
    }
  }

  const restoreProblem = async (id: number | string) => {
    try {
      const res = await fetch(`/api/problems/${id}/restore`, {
        method: "PATCH",
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || "Failed to restore problem")
      }

      const updated: Problem = json.data
      setItems((prev) =>
        prev.map((item) => (String(item.id) === String(id) ? updated : item)),
      )
    } catch (err) {
      // Optimistic update fallback
      setItems((prev) =>
        prev.map((p) =>
          String(p.id) === String(id)
            ? {
                ...p,
                status: "Learning" as const,
                nextRevision: "Tomorrow",
                updatedAt: new Date().toISOString(),
              }
            : p,
        ),
      )
      throw err
    }
  }

  const getProblemById = (id: number | string) => {
    const strId = String(id)
    return items.find((p) => String(p.id) === strId)
  }

  const completeRevision = (
    problemId: number | string,
    data: CompleteRevisionInput,
  ): CompleteRevisionResult | null => {
    const problem = items.find((p) => String(p.id) === String(problemId))
    if (!problem) return null

    const nextSchedule = calculateNextRevision(problem, data.rating)
    const now = new Date()
    const dateFormatted = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })

    const revisionRecord: Revision = {
      id: `rev-${problem.id}-${Date.now()}`,
      problemId: problem.id,
      revisionNumber: problem.revision || 1,
      scheduledDate: problem.nextRevision || "Today",
      completionDate: dateFormatted,
      status: "completed",
      rating: data.rating,
      durationMinutes: data.durationMinutes,
      notes: data.notes,
    }

    const hasDuration =
      typeof data.durationMinutes === "number" && data.durationMinutes > 0

    const newAttempt: Attempt | null = hasDuration
      ? {
          id: `att-${problem.id}-${Date.now()}`,
          problemId: problem.id,
          revisionNumber: problem.revision || 1,
          revisionId: revisionRecord.id,
          duration: data.durationMinutes!,
          timeSpent: data.durationMinutes!,
          createdDate: "Today",
          date: "Today",
          rating: data.rating,
          notes: data.notes,
        }
      : null

    let resultProblem: Problem | null = null

    setItems((prev) =>
      prev.map((p) => {
        if (String(p.id) === String(problemId)) {
          const updatedAttempts = newAttempt
            ? [newAttempt, ...(p.attempts || [])]
            : p.attempts || []

          const updatedRevisions = [revisionRecord, ...(p.revisions || [])]

          resultProblem = {
            ...p,
            revision: nextSchedule.nextRevisionNumber,
            nextRevision: nextSchedule.nextRevisionDateText,
            status: nextSchedule.nextStatus,
            lastRevisionDate: "Today",
            attempts: updatedAttempts,
            revisions: updatedRevisions,
            updatedAt: new Date().toISOString(),
          }
          return resultProblem
        }
        return p
      }),
    )

    if (!resultProblem) return null
    return {
      updatedProblem: resultProblem,
      nextSchedule,
    }
  }

  const getDueRevisions = () => {
    return items.filter(
      (p) =>
        p.status !== "Archived" &&
        p.status !== "Mastered" &&
        p.nextRevision.toLowerCase() === "today",
    )
  }

  const getOverdueRevisions = () => {
    return items.filter((p) => p.status !== "Archived" && p.status === "Overdue")
  }

  return (
    <ProblemsContext.Provider
      value={{
        items,
        setItems,
        isLoading,
        error,
        refreshProblems: fetchProblems,
        addProblem,
        updateProblem,
        archiveProblem,
        restoreProblem,
        getProblemById,
        completeRevision,
        getDueRevisions,
        getOverdueRevisions,
      }}
    >
      {children}
    </ProblemsContext.Provider>
  )
}

export function useProblems() {
  const context = useContext(ProblemsContext)
  if (context) {
    return context
  }

  // Fallback for standalone / test usage without Provider
  return {
    items: [],
    setItems: () => {},
    isLoading: false,
    error: null,
    refreshProblems: async () => {},
    addProblem: async (p: Problem | Omit<Problem, "id">) => p as Problem,
    updateProblem: async () => null,
    archiveProblem: async () => {},
    restoreProblem: async () => {},
    getProblemById: () => undefined,
    completeRevision: () => null,
    getDueRevisions: () => [],
    getOverdueRevisions: () => [],
  }
}

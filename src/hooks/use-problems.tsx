"use client"

import * as React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { problems as initialProblems } from "@/lib/mock-data"
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
  addProblem: (problem: Omit<Problem, "id"> | Problem) => Problem
  updateProblem: (id: number, data: Partial<Problem>) => Problem | null
  archiveProblem: (id: number) => void
  restoreProblem: (id: number) => void
  getProblemById: (id: number | string) => Problem | undefined
  completeRevision: (
    problemId: number,
    data: CompleteRevisionInput,
  ) => CompleteRevisionResult | null
  getDueRevisions: () => Problem[]
  getOverdueRevisions: () => Problem[]
}

const ProblemsContext = createContext<ProblemsContextType | null>(null)

const STORAGE_KEY = "dsa_mastery_problems_v1"

export function ProblemsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Problem[]>(initialProblems)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage once mounted
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Problem[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed)
        }
      }
    } catch {
      // Ignore localStorage read errors
    } finally {
      setHydrated(true)
    }
  }, [])

  // Sync to localStorage whenever items change
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Ignore quota errors
    }
  }, [items, hydrated])

  const addProblem = (problemData: Omit<Problem, "id"> | Problem): Problem => {
    const nextId =
      "id" in problemData && problemData.id
        ? problemData.id
        : items.length > 0
          ? Math.max(...items.map((p) => p.id)) + 1
          : 1

    const newProblem: Problem = {
      ...problemData,
      id: nextId,
      status: problemData.status || "Learning",
      nextRevision: problemData.nextRevision || "Today",
      revision: problemData.revision ?? 0,
      time: problemData.time ?? 30,
      attempts: problemData.attempts ?? [],
      revisions: problemData.revisions ?? [],
      createdAt: problemData.createdAt || new Date().toISOString(),
      originalSolveDate: problemData.originalSolveDate || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setItems((prev) => [newProblem, ...prev])
    return newProblem
  }

  const updateProblem = (
    id: number,
    data: Partial<Problem>,
  ): Problem | null => {
    let updatedItem: Problem | null = null

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          updatedItem = {
            ...item,
            ...data,
            id: item.id,
            attempts: data.attempts ?? item.attempts,
            revisions: data.revisions ?? item.revisions,
            revision: data.revision ?? item.revision,
            status: data.status ?? item.status,
            nextRevision: data.nextRevision ?? item.nextRevision,
            createdAt: item.createdAt,
            updatedAt: new Date().toISOString(),
          }
          return updatedItem
        }
        return item
      }),
    )

    return updatedItem
  }

  const archiveProblem = (id: number) => {
    setItems((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "Archived" as const,
              nextRevision: "—",
              updatedAt: new Date().toISOString(),
            }
          : p,
      ),
    )
  }

  const restoreProblem = (id: number) => {
    setItems((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "Learning" as const,
              nextRevision: "Tomorrow",
              updatedAt: new Date().toISOString(),
            }
          : p,
      ),
    )
  }

  const getProblemById = (id: number | string) => {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id
    if (isNaN(numericId)) return undefined
    return items.find((p) => p.id === numericId)
  }

  const completeRevision = (
    problemId: number,
    data: CompleteRevisionInput,
  ): CompleteRevisionResult | null => {
    const problem = items.find((p) => p.id === problemId)
    if (!problem) return null

    const nextSchedule = calculateNextRevision(problem, data.rating)
    const now = new Date()
    const dateFormatted = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })

    // 1. Create completed Revision record
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

    // 2. If duration was entered (> 0), record an Attempt record
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
        if (p.id === problemId) {
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
  const [items, setItems] = useState<Problem[]>(initialProblems)

  const addProblem = (problemData: Omit<Problem, "id"> | Problem): Problem => {
    const nextId =
      "id" in problemData && problemData.id
        ? problemData.id
        : items.length > 0
          ? Math.max(...items.map((p) => p.id)) + 1
          : 1

    const newProblem: Problem = {
      ...problemData,
      id: nextId,
      status: problemData.status || "Learning",
      nextRevision: problemData.nextRevision || "Today",
      revision: problemData.revision ?? 0,
      time: problemData.time ?? 30,
      attempts: problemData.attempts ?? [],
      revisions: problemData.revisions ?? [],
    }

    setItems((prev) => [newProblem, ...prev])
    return newProblem
  }

  const updateProblem = (
    id: number,
    data: Partial<Problem>,
  ): Problem | null => {
    let updated: Problem | null = null
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          updated = { ...item, ...data }
          return updated
        }
        return item
      }),
    )
    return updated
  }

  const archiveProblem = (id: number) => {
    setItems((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: "Archived" as const, nextRevision: "—" }
          : p,
      ),
    )
  }

  const restoreProblem = (id: number) => {
    setItems((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: "Learning" as const, nextRevision: "Tomorrow" }
          : p,
      ),
    )
  }

  const getProblemById = (id: number | string) => {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id
    if (isNaN(numericId)) return undefined
    return items.find((p) => p.id === numericId)
  }

  const completeRevision = (
    problemId: number,
    data: CompleteRevisionInput,
  ): CompleteRevisionResult | null => {
    const problem = items.find((p) => p.id === problemId)
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
        if (p.id === problemId) {
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
          }
          return resultProblem
        }
        return p
      }),
    )

    if (!resultProblem) return null
    return { updatedProblem: resultProblem, nextSchedule }
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

  return {
    items,
    setItems,
    addProblem,
    updateProblem,
    archiveProblem,
    restoreProblem,
    getProblemById,
    completeRevision,
    getDueRevisions,
    getOverdueRevisions,
  }
}

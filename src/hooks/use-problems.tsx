"use client"

// Hydrate from localStorage once mounted if available
// Ignore localStorage errors

// Sync back to localStorage whenever items change after initial hydration
// Ignore quota/storage errors
// Preserve non-overwritten critical fields

// Fallback for standalone / test usage without Provider

import * as React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { problems as initialProblems } from "@/lib/mock-data"
import type { Problem } from "@/types/problem"

interface ProblemsContextType {
  items: Problem[]
  setItems: React.Dispatch<React.SetStateAction<Problem[]>>
  addProblem: (problem: Omit<Problem, "id"> | Problem) => Problem
  updateProblem: (id: number, data: Partial<Problem>) => Problem | null
  archiveProblem: (id: number) => void
  restoreProblem: (id: number) => void
  getProblemById: (id: number | string) => Problem | undefined
}

const ProblemsContext = createContext<ProblemsContextType | null>(null)

const STORAGE_KEY = "dsa_mastery_problems_v1"

export function ProblemsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Problem[]>(initialProblems)
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Problem[]
        if (
          Array.isArray(parsed) &&
          parsed.length >
            0
        ) {
          setItems(parsed)
        }
      }
    } catch {
    } finally {
      setHydrated(true)
    }
  }, [])
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items, hydrated])

  const addProblem = (problemData: Omit<Problem, "id"> | Problem): Problem => {
    const nextId =
      "id" in
        problemData &&
      problemData.id
        ? problemData.id
        : items.length >
            0
          ? Math.max(...items.map((p) => p.id)) +
            1
          : 1

    const newProblem: Problem = {
      ...problemData,
      id: nextId,
      status:
        problemData.status ||
        "Learning",
      nextRevision:
        problemData.nextRevision ||
        "Today",
      revision:
        problemData.revision ??
        0,
      time:
        problemData.time ??
        30,
      attempts:
        problemData.attempts ??
        [],
      createdAt:
        problemData.createdAt ||
        new Date().toISOString(),
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
        if (
          item.id ===
          id
        ) {
          updatedItem = {
            ...item,
            ...data,
            id: item.id,
            attempts:
              data.attempts ??
              item.attempts,
            revision:
              data.revision ??
              item.revision,
            status:
              data.status ??
              item.status,
            nextRevision:
              data.nextRevision ??
              item.nextRevision,
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
        p.id ===
        id
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
        p.id ===
        id
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
    const numericId =
      typeof id ===
      "string"
        ? parseInt(id, 10)
        : id
    if (isNaN(numericId)) return undefined
    return items.find(
      (p) =>
        p.id ===
        numericId,
    )
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

  return {
    items,
    setItems,
    addProblem,
    updateProblem,
    archiveProblem,
    restoreProblem,
    getProblemById,
  }
}

"use client"

import * as React from "react"
import { createContext, useContext, useState } from "react"
import { problems as initialProblems } from "@/lib/mock-data"
import type { Problem } from "@/types/problem"

interface ProblemsContextType {
  items: Problem[]
  setItems: React.Dispatch<React.SetStateAction<Problem[]>>
  addProblem: (problem: Problem) => void
  restoreProblem: (id: number) => void
  getProblemById: (id: number | string) => Problem | undefined
}

const ProblemsContext = createContext<ProblemsContextType | null>(null)

export function ProblemsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Problem[]>(initialProblems)

  const addProblem = (problem: Problem) => {
    setItems((prev) => [problem, ...prev])
  }

  const restoreProblem = (id: number) => {
    setItems((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "Learning" as const } : p,
      ),
    )
  }

  const getProblemById = (id: number | string) => {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id
    return items.find((p) => p.id === numericId)
  }

  return (
    <ProblemsContext.Provider
      value={{
        items,
        setItems,
        addProblem,
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

  // Fallback for standalone usage
  const [items, setItems] = useState<Problem[]>(initialProblems)

  const addProblem = (problem: Problem) => {
    setItems((prev) => [problem, ...prev])
  }

  const restoreProblem = (id: number) => {
    setItems((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "Learning" as const } : p,
      ),
    )
  }

  const getProblemById = (id: number | string) => {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id
    return items.find((p) => p.id === numericId)
  }

  return {
    items,
    setItems,
    addProblem,
    restoreProblem,
    getProblemById,
  }
}

"use client"

import { useState } from "react"
import { problems as initialProblems } from "@/lib/mock-data"
import type { Problem } from "@/types/problem"

export function useProblems() {
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

  return {
    items,
    setItems,
    addProblem,
    restoreProblem,
  }
}

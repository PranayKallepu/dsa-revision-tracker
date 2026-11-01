export type Difficulty = "Easy" | "Medium" | "Hard"

export type ProblemStatus = "Learning" | "Mastered" | "Overdue" | "Archived"

export interface Problem {
  id: number
  title: string
  url: string
  difficulty: Difficulty
  platform: string
  topics: string[]
  status: ProblemStatus
  nextRevision: string
  revision: number
  time: number
}

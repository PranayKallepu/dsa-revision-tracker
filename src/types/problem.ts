import type { Attempt, Revision, RevisionRating } from "./revision"

export type Difficulty = "Easy" | "Medium" | "Hard"

export type ProblemStatus = "Learning" | "Mastered" | "Overdue" | "Archived"

export type Platform =
  | "LeetCode"
  | "GeeksforGeeks"
  | "HackerRank"
  | "Codeforces"
  | "InterviewBit"
  | "Other"

// Backward-compatibility alias
export type RevisionAttempt = Attempt

export interface Problem {
  id: number | string
  title: string
  url: string
  difficulty: Difficulty
  platform: Platform | string
  topics: string[]
  status: ProblemStatus
  nextRevision: string
  revision: number
  time: number // initial solving duration in minutes
  initialSolveDurationSeconds?: number | null
  approach?: string
  timeComplexity?: string
  spaceComplexity?: string
  notes?: string
  mistakes?: string
  lastRevisionDate?: string
  originalSolveDate?: string
  archivedAt?: string | null
  attempts?: Attempt[]
  revisions?: Revision[]
  createdAt?: string
  updatedAt?: string
}

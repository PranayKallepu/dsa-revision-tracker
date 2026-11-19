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

export const TIME_COMPLEXITY_OPTIONS = [
  { value: "O(1)", label: "O(1) — Constant" },
  { value: "O(log n)", label: "O(log n) — Logarithmic" },
  { value: "O(sqrt(n))", label: "O(√n) — Square Root" },
  { value: "O(n)", label: "O(n) — Linear" },
  { value: "O(n log n)", label: "O(n log n) — Linearithmic" },
  { value: "O(n^2)", label: "O(n²) — Quadratic" },
  { value: "O(n^3)", label: "O(n³) — Cubic" },
  { value: "O(2^n)", label: "O(2ⁿ) — Exponential" },
  { value: "O(n!)", label: "O(n!) — Factorial" },
  { value: "O(V + E)", label: "O(V + E) — Graph Linear" },
  { value: "O(m * n)", label: "O(m × n) — 2D Matrix" },
  { value: "Other", label: "Other — Custom" },
] as const

export const TIME_COMPLEXITIES = [
  "O(1)",
  "O(log n)",
  "O(sqrt(n))",
  "O(n)",
  "O(n log n)",
  "O(n^2)",
  "O(n^3)",
  "O(2^n)",
  "O(n!)",
  "O(V + E)",
  "O(m * n)",
  "Other",
] as const

export type TimeComplexity = (typeof TIME_COMPLEXITIES)[number]

export const SPACE_COMPLEXITY_OPTIONS = [
  { value: "O(1)", label: "O(1) — Constant (In-place)" },
  { value: "O(log n)", label: "O(log n) — Logarithmic (Recursion stack)" },
  { value: "O(n)", label: "O(n) — Linear (Array / Map / Stack)" },
  { value: "O(n log n)", label: "O(n log n) — Linearithmic" },
  { value: "O(n^2)", label: "O(n²) — Quadratic (2D Table / Matrix)" },
  { value: "O(2^n)", label: "O(2ⁿ) — Exponential" },
  { value: "O(V + E)", label: "O(V + E) — Graph Structures" },
  { value: "O(m * n)", label: "O(m × n) — 2D Grid" },
  { value: "Other", label: "Other — Custom" },
] as const

export const SPACE_COMPLEXITIES = [
  "O(1)",
  "O(log n)",
  "O(n)",
  "O(n log n)",
  "O(n^2)",
  "O(2^n)",
  "O(V + E)",
  "O(m * n)",
  "Other",
] as const

export type SpaceComplexity = (typeof SPACE_COMPLEXITIES)[number]

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
  timeComplexity?: TimeComplexity | string
  spaceComplexity?: SpaceComplexity | string
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

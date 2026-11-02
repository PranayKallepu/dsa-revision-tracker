export type Difficulty = "Easy" | "Medium" | "Hard"

export type ProblemStatus = "Learning" | "Mastered" | "Overdue" | "Archived"

export type Platform = "LeetCode" | "GeeksforGeeks" | "HackerRank" | "Codeforces" | "InterviewBit" | "Other"

export interface RevisionAttempt {
  id: string | number
  date: string
  timeSpent: number // in minutes
  rating: "Forgot" | "Difficult" | "Good" | "Easy"
  notes?: string
}

export interface Problem {
  id: number
  title: string
  url: string
  difficulty: Difficulty
  platform: Platform | string
  topics: string[]
  status: ProblemStatus
  nextRevision: string
  revision: number
  time: number // initial solving duration in minutes
  approach?: string
  timeComplexity?: string
  spaceComplexity?: string
  notes?: string
  mistakes?: string
  lastRevisionDate?: string
  attempts?: RevisionAttempt[]
  createdAt?: string
  updatedAt?: string
}

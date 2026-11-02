export type RevisionRating = "Forgot" | "Difficult" | "Good" | "Easy"

export type RevisionStatus = "pending" | "completed" | "overdue"

/**
 * Revision: A scheduled learning event in the spaced repetition lifecycle.
 */
export interface Revision {
  id: string
  problemId: number
  revisionNumber: number
  scheduledDate: string // e.g. "Today", "Jun 12", or ISO string
  completionDate?: string
  status: RevisionStatus
  rating?: RevisionRating
  durationMinutes?: number
  notes?: string
}

/**
 * Attempt: An active coding/solving session recording performance metrics.
 * Preserved independently even when a revision cycle restarts.
 */
export interface Attempt {
  id: string | number
  problemId?: number
  revisionNumber?: number
  revisionId?: string
  duration?: number // in minutes
  timeSpent?: number // alias for duration
  createdDate?: string
  date?: string // alias for createdDate
  rating?: RevisionRating
  notes?: string
}

export interface RatingOption {
  value: RevisionRating
  label: string
  description: string
  outcome: string
  tone: "danger" | "warning" | "primary" | "success"
}

export const REVISION_RATING_OPTIONS: RatingOption[] = [
  {
    value: "Forgot",
    label: "Forgot",
    description: "I could not recall or solve the problem.",
    outcome: "Restarts revision cycle (Day 1 tomorrow)",
    tone: "danger",
  },
  {
    value: "Difficult",
    label: "Difficult",
    description: "I needed significant help or struggled.",
    outcome: "Restarts revision cycle (Day 1 tomorrow)",
    tone: "warning",
  },
  {
    value: "Good",
    label: "Good",
    description: "I solved it with reasonable confidence.",
    outcome: "Advances to next spaced interval",
    tone: "primary",
  },
  {
    value: "Easy",
    label: "Easy",
    description: "I solved it confidently with minimal effort.",
    outcome: "Advances to next spaced interval",
    tone: "success",
  },
]

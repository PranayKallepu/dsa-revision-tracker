export type ActivityTone = "success" | "primary" | "warning" | "neutral"

export interface ActivityItem {
  action: string
  problem: string
  detail: string
  time: string
  tone: ActivityTone
}

export interface UpcomingDay {
  day: string
  date: string
  count: number
  active?: boolean
}

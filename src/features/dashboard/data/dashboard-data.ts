import type { UpcomingDay } from "@/types/activity"
import type { TopicMomentumItem } from "../types"

export const defaultUpcomingDays: UpcomingDay[] = [
  { day: "Today", date: "08", count: 5, active: true },
  { day: "Mon", date: "09", count: 3 },
  { day: "Tue", date: "10", count: 2 },
  { day: "Wed", date: "11", count: 6 },
  { day: "Thu", date: "12", count: 1 },
  { day: "Fri", date: "13", count: 4 },
  { day: "Sat", date: "14", count: 2 },
]

export const defaultTopicMomentum: TopicMomentumItem[] = [
  { topic: "Arrays & Hashing", percentage: 86 },
  { topic: "Graphs", percentage: 68 },
  { topic: "Dynamic Programming", percentage: 54 },
  { topic: "Trees", percentage: 74 },
]

export const defaultOverdueDaysMap: Record<number, number> = {
  1: 3, // Problem ID 1: 3 days overdue
  5: 1, // Fallback if 5 becomes overdue
}

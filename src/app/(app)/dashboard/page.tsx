import type { Metadata } from "next"
import { DashboardView } from "@/features/dashboard"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Monitor your DSA revision queue, overdue intervals, and mastery progress.",
}

export default function DashboardPage() {
  return <DashboardView />
}

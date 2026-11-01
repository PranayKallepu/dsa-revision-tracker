import {
  Archive,
  BarChart3,
  History,
  Home,
  ListChecks,
  RotateCcw,
  Trophy,
} from "lucide-react"
import type { NavGroup, Screen } from "@/types/navigation"

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: Home },
      { id: "problems", label: "My Problems", href: "/problems", icon: ListChecks },
      { id: "revision", label: "Revision Queue", href: "/revisions", icon: RotateCcw },
      { id: "mastery", label: "Mastery Tests", href: "/mastery", icon: Trophy },
    ],
  },
  {
    label: "Insights",
    items: [
      { id: "analytics", label: "Analytics", href: "/analytics", icon: BarChart3 },
      { id: "activity", label: "Activity History", href: "/activity", icon: History },
      { id: "archived", label: "Archived", href: "/archived", icon: Archive },
    ],
  },
]

export const SCREEN_TITLES: Record<Screen, [string, string]> = {
  dashboard: ["Good morning, Alex", "Here’s what needs your attention today."],
  problems: [
    "My Problems",
    "Organize, search, and track your entire practice library.",
  ],
  add: ["Add a problem", "Capture the key details while they’re fresh."],
  details: [
    "Problem details",
    "Review your notes, attempts, and revision journey.",
  ],
  revision: [
    "Revision workspace",
    "Recall first. Reveal second. Rate honestly.",
  ],
  mastery: [
    "Mastery test",
    "Prove you can solve it independently under time pressure.",
  ],
  analytics: [
    "Analytics",
    "Understand your consistency, speed, and topic strengths.",
  ],
  activity: [
    "Activity history",
    "A complete timeline of your learning progress.",
  ],
  archived: [
    "Archived problems",
    "Problems removed from your active revision schedule.",
  ],
}

export const ROUTE_TITLES: Record<string, [string, string]> = {
  "/dashboard": ["Good morning, Alex", "Here’s what needs your attention today."],
  "/problems": [
    "My Problems",
    "Organize, search, and track your entire practice library.",
  ],
  "/problems/new": [
    "Add a problem",
    "Capture the key details while they’re fresh.",
  ],
  "/revisions": [
    "Revision workspace",
    "Recall first. Reveal second. Rate honestly.",
  ],
  "/mastery": [
    "Mastery test",
    "Prove you can solve it independently under time pressure.",
  ],
  "/analytics": [
    "Analytics",
    "Understand your consistency, speed, and topic strengths.",
  ],
  "/activity": [
    "Activity history",
    "A complete timeline of your learning progress.",
  ],
  "/archived": [
    "Archived problems",
    "Problems removed from your active revision schedule.",
  ],
}

export function getHeaderTitle(pathname: string): [string, string] {
  if (ROUTE_TITLES[pathname]) {
    return ROUTE_TITLES[pathname]
  }
  if (pathname.startsWith("/problems/")) {
    return ["Problem details", "Review your notes, attempts, and revision journey."]
  }
  return ["Good morning, Alex", "Here’s what needs your attention today."]
}

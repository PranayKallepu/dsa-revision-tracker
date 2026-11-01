export type Screen =
  | "dashboard"
  | "problems"
  | "add"
  | "details"
  | "revision"
  | "mastery"
  | "analytics"
  | "activity"
  | "archived"

export interface NavItem {
  id: Screen
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

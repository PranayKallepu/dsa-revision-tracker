import { Badge } from "@/components/ui"
import type { Difficulty } from "@/types/problem"

export interface DifficultyBadgeProps {
  value: Difficulty
}

export function DifficultyBadge({ value }: DifficultyBadgeProps) {
  return (
    <Badge
      tone={
        value === "Easy" ? "success" : value === "Medium" ? "warning" : "danger"
      }
    >
      {value}
    </Badge>
  )
}

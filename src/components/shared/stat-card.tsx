import type { LucideIcon } from "lucide-react"
import { MoreHorizontal } from "lucide-react"
import { Card } from "@/components/ui"
import { cn } from "@/lib/utils"

export interface StatCardProps {
  label: string
  value: string
  note: string
  icon: LucideIcon
  tone?: "primary" | "danger" | "success" | "warning"
}

export function StatCard({
  label,
  value,
  note,
  icon: Icon,
  tone = "primary",
}: StatCardProps) {
  const tones = {
    primary: "bg-secondary text-primary",
    danger: "bg-red-50 text-danger",
    success: "bg-emerald-50 text-success",
    warning: "bg-amber-50 text-warning",
  }
  return (
    <Card className="p-5">
      <div className="mb-5 flex items-start justify-between">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            tones[tone],
          )}
        >
          <Icon className="size-5" />
        </div>
        <MoreHorizontal className="size-5 text-muted-foreground/50" />
      </div>
      <div className="text-3xl font-bold tracking-tight">{value}</div>
      <div className="mt-1 text-sm font-medium">{label}</div>
      <div className="mt-2 text-xs text-muted-foreground">{note}</div>
    </Card>
  )
}

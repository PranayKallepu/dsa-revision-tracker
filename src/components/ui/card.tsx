import * as React from "react"
import { cn } from "@/lib/utils"

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card border bg-card shadow-sm shadow-slate-900/5",
        className,
      )}
      {...props}
    />
  )
}

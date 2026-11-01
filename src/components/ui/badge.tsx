import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
      tone: {
        neutral: "border-transparent bg-muted text-muted-foreground",
        primary: "border-transparent bg-secondary text-secondary-foreground",
        success: "border-transparent bg-emerald-50 text-success",
        warning: "border-transparent bg-amber-50 text-warning",
        danger: "border-transparent bg-red-50 text-danger",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, tone, ...props }: BadgeProps) {
  // If a specific variant is passed and tone is not explicitly passed, let variant handle it
  const resolvedTone = variant ? undefined : (tone ?? "neutral")
  return (
    <div
      className={cn(badgeVariants({ variant, tone: resolvedTone }), className)}
      {...props}
    />
  )
}

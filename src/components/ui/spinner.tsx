import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  label?: string
}

const sizeClasses = {
  xs: "size-3",
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
  xl: "size-12",
}

export function Spinner({
  size = "md",
  className,
  label = "Loading...",
  ...props
}: SpinnerProps) {
  return (
    <div role="status" className="inline-flex items-center gap-2">
      <Loader2
        className={cn("animate-spin text-primary", sizeClasses[size], className)}
        aria-hidden="true"
        {...props}
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}

export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string
  transparent?: boolean
}

export function LoadingOverlay({
  message = "Loading...",
  transparent = false,
  className,
  ...props
}: LoadingOverlayProps) {
  return (
    <div
      role="status"
      className={cn(
        "absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 rounded-xl",
        transparent
          ? "bg-background/60 backdrop-blur-xs"
          : "bg-background/80 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      <Spinner size="lg" />
      {message && (
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          {message}
        </p>
      )}
      <span className="sr-only">{message}</span>
    </div>
  )
}

export function LoadingCard({
  message = "Loading data...",
  className,
}: {
  message?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center",
        className
      )}
    >
      <Spinner size="md" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  )
}


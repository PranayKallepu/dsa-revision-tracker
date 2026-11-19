import { Spinner } from "@/components/ui/spinner"

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-background">
      <div className="relative flex items-center justify-center">
        <div className="size-16 rounded-full border-4 border-primary/20 animate-pulse" />
        <Spinner size="lg" className="absolute" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-semibold text-foreground tracking-tight">
          DSA Revision Tracker
        </p>
        <p className="text-xs text-muted-foreground animate-pulse">
          Loading workspace...
        </p>
      </div>
    </div>
  )
}


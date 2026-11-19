import { Skeleton } from "@/components/ui/skeleton"

export default function ProblemDetailLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 animate-in fade-in-50 duration-300">
      {/* Back button and actions */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-24 rounded-xl" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>

      {/* Main Problem Header Card */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-8 w-3/4 rounded-lg" />
        <Skeleton className="h-4 w-1/2 rounded-md" />

        {/* Complexity Grid */}
        <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-muted/30 p-3.5 space-y-1.5">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Approach & Notes Skeleton */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <Skeleton className="h-5 w-28 rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-5/6 rounded-md" />
          <Skeleton className="h-4 w-4/6 rounded-md" />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <Skeleton className="h-5 w-32 rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-3/4 rounded-md" />
        </div>
      </div>
    </div>
  )
}


import { Skeleton } from "@/components/ui/skeleton"

export default function ProblemsLoading() {
  return (
    <div className="space-y-6 p-6 animate-in fade-in-50 duration-300">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* Filter and Search Bar Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-4">
        <Skeleton className="h-10 w-full sm:w-72 rounded-xl" />
        <div className="flex items-center gap-2 overflow-x-auto">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>

      {/* Problems Table Skeleton */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-3.5">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-border/60">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-4 rounded-md" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-52 rounded-md" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-16 rounded-md" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-14 rounded-md" />
              </div>
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


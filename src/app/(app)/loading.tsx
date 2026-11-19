import { Skeleton } from "@/components/ui/skeleton"

export default function AppLoading() {
  return (
    <div className="space-y-6 p-6 animate-in fade-in-50 duration-300">
      {/* Top Banner Skeleton */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="size-8 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-3 w-32 rounded-md" />
          </div>
        ))}
      </div>

      {/* Content Columns Skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
          <div className="space-y-3 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-border/50 p-3.5">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-9 rounded-lg" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-40 rounded-md" />
                    <Skeleton className="h-3 w-24 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <Skeleton className="h-5 w-32 rounded-md" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/50 p-4 space-y-2">
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-full rounded-md" />
                <Skeleton className="h-2 w-full rounded-full mt-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


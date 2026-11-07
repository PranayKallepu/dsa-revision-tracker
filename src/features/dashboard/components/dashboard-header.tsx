import Link from "next/link"
import { Award, Plus, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui"

export function DashboardHeader() {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your spaced repetition queue, overdue items, and DSA mastery progress.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <Button variant="outline" size="sm" asChild>
          <Link href="/mastery">
            <Award className="size-4" />
            <span className="hidden sm:inline">Mastery Test</span>
            <span className="sm:hidden">Test</span>
          </Link>
        </Button>
        <Button variant="soft" size="sm" asChild>
          <Link href="/revisions">
            <RotateCcw className="size-4" />
            <span className="hidden sm:inline">Start Revision</span>
            <span className="sm:hidden">Revise</span>
          </Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/problems/new">
            <Plus className="size-4" />
            <span>Add Problem</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}

"use client"

import { useMemo, useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button, Card, Input, Select } from "@/components/ui"
import { ProblemsTable } from "./problems-table"
import type { Problem } from "@/types/problem"
import type { Screen } from "@/types/navigation"

export interface ProblemsViewProps {
  items: Problem[]
  setScreen: (s: Screen) => void
}

export function ProblemsView({ items, setScreen }: ProblemsViewProps) {
  const [query, setQuery] = useState("")
  const [difficulty, setDifficulty] = useState("All")
  const filtered = useMemo(
    () =>
      items.filter(
        (p) =>
          p.status !== "Archived" &&
          p.title.toLowerCase().includes(query.toLowerCase()) &&
          (difficulty === "All" || p.difficulty === difficulty),
      ),
    [items, query, difficulty],
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search problems, topics, platforms…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select
          className="sm:w-40"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option>All</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </Select>
        <Button onClick={() => setScreen("add")}>
          <Plus className="size-4" />
          Add problem
        </Button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["All problems 148", "Learning 78", "Mastered 46", "Overdue 2"].map(
          (x, i) => (
            <Button key={x} variant={i === 0 ? "soft" : "outline"} size="sm">
              {x}
            </Button>
          ),
        )}
      </div>
      <Card className="overflow-hidden">
        <ProblemsTable
          items={filtered}
          onDetails={() => setScreen("details")}
        />
        <div className="flex items-center justify-between border-t p-4 text-sm text-muted-foreground">
          <span>Showing {filtered.length} of 148 problems</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

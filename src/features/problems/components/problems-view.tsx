"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Archive,
  FilterX,
  FolderOpen,
  Plus,
  RotateCcw,
  Search,
} from "lucide-react"
import {
  Button,
  Card,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui"
import { ProblemsTable } from "./problems-table"
import { useProblems } from "@/hooks/use-problems"
import { PLATFORMS } from "../schema"
import type { Problem } from "@/types/problem"
import type { Screen } from "@/types/navigation"

export interface ProblemsViewProps {
  items?: Problem[]
  setScreen?: (s: Screen) => void
}

const ITEMS_PER_PAGE = 8

export function ProblemsView({
  items: propItems,
  setScreen,
}: ProblemsViewProps) {
  const router = useRouter()
  const { items: contextItems, archiveProblem, restoreProblem } = useProblems()
  const items = propItems || contextItems
  const [query, setQuery] = useState("")
  const [difficulty, setDifficulty] = useState<string>("All")
  const [platform, setPlatform] = useState<string>("All")
  const [topic, setTopic] = useState<string>("All")
  const [statusFilter, setStatusFilter] = useState<string>("active")
  const [currentPage, setCurrentPage] = useState<number>(1)

  const allTopics = useMemo(() => {
    const set = new Set<string>()
    items.forEach((p) => p.topics?.forEach((t) => set.add(t)))
    return Array.from(set).sort()
  }, [items])

  const counts = useMemo(() => {
    const total = items.length
    const active = items.filter((p) => p.status !== "Archived").length
    const learning = items.filter((p) => p.status === "Learning").length
    const mastered = items.filter((p) => p.status === "Mastered").length
    const overdue = items.filter((p) => p.status === "Overdue").length
    const archived = items.filter((p) => p.status === "Archived").length
    return { total, active, learning, mastered, overdue, archived }
  }, [items])

  const filtered = useMemo(() => {
    return items.filter((p) => {
      if (statusFilter === "active" && p.status === "Archived") return false
      if (statusFilter === "Archived" && p.status !== "Archived") return false
      if (
        statusFilter !== "all" &&
        statusFilter !== "active" &&
        statusFilter !== "Archived" &&
        p.status !== statusFilter
      ) {
        return false
      }
      if (query.trim()) {
        const q = query.toLowerCase()
        const matchesTitle = p.title.toLowerCase().includes(q)
        const matchesTopic = p.topics?.some((t) => t.toLowerCase().includes(q))
        const matchesPlatform = p.platform?.toLowerCase().includes(q)
        if (!matchesTitle && !matchesTopic && !matchesPlatform) {
          return false
        }
      }
      if (difficulty !== "All" && p.difficulty !== difficulty) {
        return false
      }
      if (platform !== "All" && p.platform !== platform) {
        return false
      }
      if (topic !== "All" && !p.topics?.includes(topic)) {
        return false
      }

      return true
    })
  }, [items, query, difficulty, platform, topic, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, currentPage])

  const hasActiveFilters =
    query.trim() !== "" ||
    difficulty !== "All" ||
    platform !== "All" ||
    topic !== "All" ||
    statusFilter !== "active"

  const handleClearFilters = () => {
    setQuery("")
    setDifficulty("All")
    setPlatform("All")
    setTopic("All")
    setStatusFilter("active")
    setCurrentPage(1)
  }

  const handleAddProblem = () => {
    if (setScreen) {
      setScreen("add")
    } else {
      router.push("/problems/new")
    }
  }

  const handleDetails = (id: number | string) => {
    if (setScreen) {
      setScreen("details")
    } else {
      router.push(`/problems/${id}`)
    }
  }

  const handleEdit = (id: number | string) => {
    router.push(`/problems/${id}/edit`)
  }

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Problems
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your DSA problem collection.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" asChild>
            <Link href="/archived">
              <Archive className="size-4 mr-1.5" />
              Archived ({counts.archived})
            </Link>
          </Button>
          <Button size="sm" onClick={handleAddProblem}>
            <Plus className="size-4 mr-1.5" />
            Add Problem
          </Button>
        </div>
      </div>

      {/* 2. Status Quick Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Button
          variant={statusFilter === "active" ? "default" : "outline"}
          size="sm"
          className="rounded-full text-xs"
          onClick={() => {
            setStatusFilter("active")
            setCurrentPage(1)
          }}
        >
          Active ({counts.active})
        </Button>
        <Button
          variant={statusFilter === "Learning" ? "default" : "outline"}
          size="sm"
          className="rounded-full text-xs"
          onClick={() => {
            setStatusFilter("Learning")
            setCurrentPage(1)
          }}
        >
          Learning ({counts.learning})
        </Button>
        <Button
          variant={statusFilter === "Mastered" ? "default" : "outline"}
          size="sm"
          className="rounded-full text-xs"
          onClick={() => {
            setStatusFilter("Mastered")
            setCurrentPage(1)
          }}
        >
          Mastered ({counts.mastered})
        </Button>
        <Button
          variant={statusFilter === "Overdue" ? "default" : "outline"}
          size="sm"
          className="rounded-full text-xs"
          onClick={() => {
            setStatusFilter("Overdue")
            setCurrentPage(1)
          }}
        >
          Overdue ({counts.overdue})
        </Button>
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          className="rounded-full text-xs"
          onClick={() => {
            setStatusFilter("all")
            setCurrentPage(1)
          }}
        >
          All Problems ({counts.total})
        </Button>
        <Button
          variant={statusFilter === "Archived" ? "default" : "outline"}
          size="sm"
          className="rounded-full text-xs"
          onClick={() => {
            setStatusFilter("Archived")
            setCurrentPage(1)
          }}
        >
          Archived ({counts.archived})
        </Button>
      </div>

      {/* 3. Search and Multi-filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by title, topic, platform..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Difficulty Filter */}
            <Select
              value={difficulty}
              onValueChange={(val) => {
                setDifficulty(val)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Difficulty</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            {/* Platform Filter */}
            <Select
              value={platform}
              onValueChange={(val) => {
                setPlatform(val)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Platforms</SelectItem>
                {PLATFORMS.map((plat) => (
                  <SelectItem key={plat} value={plat}>
                    {plat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Topic Filter */}
            <Select
              value={topic}
              onValueChange={(val) => {
                setTopic(val)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Topics</SelectItem>
                {allTopics.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters Action */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <FilterX className="size-3.5 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 4. Table or Empty State Card */}
      <Card className="overflow-hidden">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <FolderOpen className="size-7" />
            </div>
            <h3 className="mt-4 text-base font-semibold">
              No problems in library
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Get started by adding your first problem to track spaced revisions
              and complexity notes.
            </p>
            <Button className="mt-5" onClick={handleAddProblem}>
              <Plus className="size-4 mr-1.5" />
              Add Your First Problem
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <FilterX className="size-7" />
            </div>
            <h3 className="mt-4 text-base font-semibold">
              No matching problems found
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              We couldn't find any problems matching your current search and
              filter criteria.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-5"
              onClick={handleClearFilters}
            >
              <RotateCcw className="size-4 mr-1.5" />
              Reset All Filters
            </Button>
          </div>
        ) : (
          <>
            <ProblemsTable
              items={paginatedItems}
              onView={handleDetails}
              onEdit={handleEdit}
              onArchive={archiveProblem}
              onRestore={restoreProblem}
            />

            {/* Pagination Controls */}
            <div className="flex flex-col items-center justify-between gap-3 border-t p-4 text-sm text-muted-foreground sm:flex-row">
              <span>
                Showing{" "}
                {Math.min(
                  (currentPage - 1) * ITEMS_PER_PAGE + 1,
                  filtered.length,
                )}{" "}
                to {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of{" "}
                {filtered.length} problem{filtered.length === 1 ? "" : "s"}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="px-2 text-xs font-medium text-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Archive,
  Clock,
  Edit,
  ExternalLink,
  Eye,
  MoreHorizontal,
  RotateCcw,
} from "lucide-react"
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui"
import { DifficultyBadge } from "@/components/shared/difficulty-badge"
import type { Problem } from "@/types/problem"

export interface ProblemsTableProps {
  items: Problem[]
  onView?: (id: number | string) => void
  onEdit?: (id: number | string) => void
  onArchive?: (id: number | string) => void
  onRestore?: (id: number | string) => void
}

export function ProblemsTable({
  items,
  onView,
  onEdit,
  onArchive,
  onRestore,
}: ProblemsTableProps) {
  const router = useRouter()

  const handleView = (id: number | string) => {
    if (onView) {
      onView(id)
    } else {
      router.push(`/problems/${id}`)
    }
  }

  const handleEdit = (id: number | string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      router.push(`/problems/${id}/edit`)
    }
  }

  const formatExternalUrl = (url: string) => {
    if (!url) return "#"
    return url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `https://${url}`
  }

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[840px]">
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[320px] font-semibold">Problem</TableHead>
            <TableHead className="font-semibold">Difficulty</TableHead>
            <TableHead className="font-semibold">Platform</TableHead>
            <TableHead className="font-semibold">Topics</TableHead>
            <TableHead className="font-semibold">Solving Time</TableHead>
            <TableHead className="font-semibold">Last Revision</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="w-12 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((p) => {
            const lastRev =
              p.lastRevisionDate ||
              (p.attempts && p.attempts.length > 0
                ? p.attempts[0].date
                : p.status === "Archived"
                  ? "—"
                  : "Not yet")

            return (
              <TableRow key={p.id} className="group hover:bg-muted/40">
                <TableCell className="py-3.5">
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => handleView(p.id)}
                      className="text-left font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                    >
                      {p.title}
                    </button>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <a
                        href={formatExternalUrl(p.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-foreground hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>External link</span>
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3.5">
                  <DifficultyBadge value={p.difficulty} />
                </TableCell>
                <TableCell className="py-3.5">
                  <span className="font-medium text-muted-foreground text-xs">
                    {p.platform || "Other"}
                  </span>
                </TableCell>
                <TableCell className="py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {p.topics.slice(0, 2).map((t) => (
                      <Badge
                        key={t}
                        tone="neutral"
                        className="text-[11px] font-normal"
                      >
                        {t}
                      </Badge>
                    ))}
                    {p.topics.length > 2 && (
                      <Badge
                        tone="neutral"
                        className="text-[11px] font-normal text-muted-foreground"
                      >
                        +{p.topics.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-3.5 text-muted-foreground">
                  <span className="inline-flex items-center gap-1 text-xs font-medium">
                    <Clock className="size-3.5 text-muted-foreground/70" />
                    {p.time ? `${p.time} min` : "—"}
                  </span>
                </TableCell>
                <TableCell className="py-3.5 text-muted-foreground text-xs font-medium">
                  {lastRev}
                </TableCell>
                <TableCell className="py-3.5">
                  <Badge
                    tone={
                      p.status === "Mastered"
                        ? "success"
                        : p.status === "Overdue"
                          ? "danger"
                          : p.status === "Archived"
                            ? "neutral"
                            : "primary"
                    }
                  >
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-3.5 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={`Actions for ${p.title}`}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => handleView(p.id)}>
                        <Eye className="size-4 mr-2" />
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(p.id)}>
                        <Edit className="size-4 mr-2" />
                        Edit problem
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/revisions/${p.id}`}>
                          <RotateCcw className="size-4 mr-2" />
                          Start revision
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {p.status === "Archived" ? (
                        <DropdownMenuItem
                          onClick={() => onRestore?.(p.id)}
                          className="text-primary focus:text-primary"
                        >
                          <RotateCcw className="size-4 mr-2" />
                          Restore problem
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => onArchive?.(p.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Archive className="size-4 mr-2" />
                          Archive problem
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

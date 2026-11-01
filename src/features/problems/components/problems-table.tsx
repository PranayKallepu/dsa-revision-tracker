import { MoreHorizontal } from "lucide-react"
import { Badge, Button } from "@/components/ui"
import { DifficultyBadge } from "@/components/shared/difficulty-badge"
import type { Problem } from "@/types/problem"

export interface ProblemsTableProps {
  items: Problem[]
  onDetails: () => void
}

export function ProblemsTable({ items, onDetails }: ProblemsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead className="border-b bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-5 py-3 font-semibold">Problem</th>
            <th className="px-4 py-3 font-semibold">Difficulty</th>
            <th className="px-4 py-3 font-semibold">Topics</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Next revision</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((p) => (
            <tr key={p.id} className="hover:bg-muted/40">
              <td className="px-5 py-4">
                <button className="text-left" onClick={onDetails}>
                  <div className="font-semibold">{p.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {p.platform}
                  </div>
                </button>
              </td>
              <td className="px-4 py-4">
                <DifficultyBadge value={p.difficulty} />
              </td>
              <td className="px-4 py-4">
                <div className="flex gap-1.5">
                  {p.topics.slice(0, 2).map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
              </td>
              <td className="px-4 py-4">
                <Badge
                  tone={
                    p.status === "Mastered"
                      ? "success"
                      : p.status === "Overdue"
                        ? "danger"
                        : "primary"
                  }
                >
                  {p.status}
                </Badge>
              </td>
              <td className="px-4 py-4 text-muted-foreground">
                {p.nextRevision}
              </td>
              <td className="px-4 py-4">
                <Button variant="ghost" size="icon" onClick={onDetails}>
                  <MoreHorizontal className="size-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

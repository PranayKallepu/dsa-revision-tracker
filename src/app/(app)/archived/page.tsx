"use client"

import { ArchiveView } from "@/features/archive"
import { useProblems } from "@/hooks"

export default function ArchivedPage() {
  const { items, restoreProblem } = useProblems()
  return <ArchiveView items={items} restore={restoreProblem} />
}

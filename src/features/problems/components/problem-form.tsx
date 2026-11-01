"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Code2 } from "lucide-react"
import {
  Button,
  Card,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/components/ui"
import { useProblems } from "@/hooks/use-problems"
import type { Problem } from "@/types/problem"
import type { Screen } from "@/types/navigation"

export interface ProblemFormProps {
  addProblem?: (p: Problem) => void
  setScreen?: (s: Screen) => void
}

export function ProblemForm({ addProblem: propAddProblem, setScreen }: ProblemFormProps) {
  const router = useRouter()
  const { addProblem: contextAddProblem } = useProblems()
  const addProblem = propAddProblem || contextAddProblem

  const [title, setTitle] = useState("")

  const handleBack = () => {
    if (setScreen) {
      setScreen("problems")
    } else {
      router.push("/problems")
    }
  }

  const save = () => {
    if (!title.trim()) return
    addProblem({
      id: Date.now(),
      title,
      url: "leetcode.com",
      difficulty: "Medium",
      platform: "LeetCode",
      topics: ["Arrays"],
      status: "Learning",
      nextRevision: "Tomorrow",
      revision: 0,
      time: 0,
    })
    handleBack()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={handleBack}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <div className="font-semibold">Back to problems</div>
          <div className="text-xs text-muted-foreground">
            Your draft is stored locally
          </div>
        </div>
      </div>
      <Card className="p-5 sm:p-7">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
            <Code2 className="size-5" />
          </div>
          <div>
            <div className="text-lg font-bold">Problem information</div>
            <div className="text-sm text-muted-foreground">
              Start with the source and classification.
            </div>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Problem title</Label>
            <Input
              placeholder="e.g. Longest Palindromic Substring"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Problem URL</Label>
            <Input placeholder="https://leetcode.com/problems/…" />
          </div>
          <div>
            <Label>Platform</Label>
            <Select defaultValue="LeetCode">
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LeetCode">LeetCode</SelectItem>
                <SelectItem value="GeeksforGeeks">GeeksforGeeks</SelectItem>
                <SelectItem value="Codeforces">Codeforces</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Difficulty</Label>
            <Select defaultValue="Medium">
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label>Topics</Label>
            <Input placeholder="Arrays, Dynamic Programming, Strings" />
            <div className="mt-2 text-xs text-muted-foreground">
              Separate topics with commas.
            </div>
          </div>
        </div>
      </Card>
      <Card className="p-5 sm:p-7">
        <div className="mb-6">
          <div className="text-lg font-bold">Solution reflection</div>
          <div className="text-sm text-muted-foreground">
            Document your thinking, not just the final answer.
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <Label>Approach</Label>
            <Textarea placeholder="Explain the intuition and step-by-step approach…" />
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <Label>Time complexity</Label>
              <Input placeholder="O(n log n)" />
            </div>
            <div>
              <Label>Space complexity</Label>
              <Input placeholder="O(n)" />
            </div>
            <div>
              <Label>Solving time</Label>
              <Input type="number" placeholder="Minutes" />
            </div>
          </div>
          <div>
            <Label>Notes & gotchas</Label>
            <Textarea placeholder="Edge cases, mistakes, alternative approaches…" />
          </div>
        </div>
      </Card>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={handleBack}>
          Cancel
        </Button>
        <Button onClick={save}>
          <Check className="size-4" />
          Save problem
        </Button>
      </div>
    </div>
  )
}

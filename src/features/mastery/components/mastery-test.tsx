"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Check,
  EyeOff,
  LockKeyhole,
  Target,
  Timer,
  Trophy,
} from "lucide-react"
import {
  Badge,
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
import type { Screen } from "@/types/navigation"

export interface MasteryTestProps {
  setScreen?: (s: Screen) => void
}

export function MasteryTest({ setScreen }: MasteryTestProps) {
  const router = useRouter()

  const navigate = (screen: Screen) => {
    if (setScreen) {
      setScreen(screen)
    } else {
      router.push("/dashboard")
    }
  }

  const [started, setStarted] = useState(false)
  const [complete, setComplete] = useState(false)

  if (complete)
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-50 text-success">
          <Trophy className="size-10" />
        </div>
        <div className="mt-6 text-3xl font-bold">Mastery confirmed</div>
        <p className="mt-3 text-muted-foreground">
          Solved independently in 18:24 with an optimal approach.
        </p>
        <Card className="mt-6 grid grid-cols-3 divide-x p-5">
          <div>
            <div className="text-2xl font-bold">18:24</div>
            <div className="text-xs text-muted-foreground">Solve time</div>
          </div>
          <div>
            <div className="text-2xl font-bold">100%</div>
            <div className="text-xs text-muted-foreground">Test cases</div>
          </div>
          <div>
            <div className="text-2xl font-bold">O(n)</div>
            <div className="text-xs text-muted-foreground">Complexity</div>
          </div>
        </Card>
        <Button className="mt-6" onClick={() => navigate("dashboard")}>
          Return to dashboard
        </Button>
      </div>
    )

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Card className="overflow-hidden">
        <div className="bg-slate-950 p-6 text-white sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div>
              <Badge className="bg-white/10 text-white">Mastery test</Badge>
              <div className="mt-4 text-2xl font-bold">Number of Islands</div>
              <p className="mt-2 max-w-xl text-sm text-slate-300">
                Solve independently without notes. Your revision count unlocked
                this test; only a successful solve confirms mastery.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
              <div className="font-mono text-3xl font-bold">
                {started ? "24:38" : "25:00"}
              </div>
              <div className="text-xs text-slate-400">Time remaining</div>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          {!started ? (
            <div className="py-10 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
                <LockKeyhole className="size-6" />
              </div>
              <div className="mt-5 text-xl font-bold">Ready to begin?</div>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                The 25-minute timer starts immediately. Notes stay hidden until
                you submit.
              </p>
              <div className="mx-auto mt-6 grid max-w-lg gap-3 text-left sm:grid-cols-3">
                {[
                  ["No notes", EyeOff],
                  ["25 minutes", Timer],
                  ["One attempt", Target],
                ].map(([t, Icon]) => {
                  const LucideIconComp = Icon as React.ComponentType<{
                    className?: string
                  }>
                  return (
                    <div
                      key={t as string}
                      className="flex items-center gap-2 rounded-xl bg-muted p-3 text-sm font-medium"
                    >
                      <LucideIconComp className="size-4 text-primary" />
                      {t as string}
                    </div>
                  )
                })}
              </div>
              <Button
                className="mt-6"
                size="lg"
                onClick={() => setStarted(true)}
              >
                Start mastery test <ArrowRight className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <div className="mb-2 font-bold">Your solution</div>
                <Textarea
                  className="min-h-64 font-mono text-xs"
                  placeholder="// Write your solution or paste code here…"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Actual complexity</Label>
                  <Input placeholder="Time O(n), Space O(n)" />
                </div>
                <div>
                  <Label>Confidence</Label>
                  <Select defaultValue="high">
                    <SelectTrigger>
                      <SelectValue placeholder="Select confidence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High — fully independent</SelectItem>
                      <SelectItem value="medium">Medium — some uncertainty</SelectItem>
                      <SelectItem value="low">Low — struggled significantly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setComplete(true)}>
                  <Check className="size-4" />
                  Submit assessment
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

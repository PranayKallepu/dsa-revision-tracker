import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button, Card, Progress } from "@/components/ui"
import { defaultTopicMomentum } from "../data/dashboard-data"

export function TopicMomentumCard() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-foreground">Topic Momentum</h2>
          <div className="text-xs text-muted-foreground">Mastery rate by topic</div>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {defaultTopicMomentum.map(({ topic, percentage }) => (
          <div key={topic}>
            <div className="mb-1.5 flex justify-between text-sm">
              <span className="font-medium text-foreground">{topic}</span>
              <span className="text-xs font-semibold text-muted-foreground">
                {percentage}%
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        ))}
      </div>

      <Button className="mt-5 w-full" variant="outline" asChild>
        <Link href="/analytics">
          View full analytics
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </Card>
  )
}

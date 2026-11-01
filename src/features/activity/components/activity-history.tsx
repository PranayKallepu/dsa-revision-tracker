import { Search } from "lucide-react"
import {
  Card,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui"
import { activities } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function ActivityHistory() {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b p-5 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search activity…" />
        </div>
        <Select defaultValue="All activity">
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Filter activity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All activity">All activity</SelectItem>
            <SelectItem value="Revisions">Revisions</SelectItem>
            <SelectItem value="Problems">Problems</SelectItem>
            <SelectItem value="Mastery tests">Mastery tests</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="p-5">
        <div className="relative ml-4 border-l pl-7">
          {[...activities, ...activities.slice(0, 3)].map((a, i) => (
            <div key={`${a.problem}-${i}`} className="relative pb-7 last:pb-0">
              <div
                className={cn(
                  "absolute -left-[37px] flex size-5 items-center justify-center rounded-full ring-4 ring-white",
                  a.tone === "success"
                    ? "bg-emerald-500"
                    : a.tone === "warning"
                      ? "bg-amber-500"
                      : a.tone === "primary"
                        ? "bg-primary"
                        : "bg-slate-400",
                )}
              >
                <div className="size-1.5 rounded-full bg-white" />
              </div>
              <div className="rounded-xl border p-4">
                <div className="flex flex-col justify-between gap-2 sm:flex-row">
                  <div>
                    <div className="text-sm font-semibold">{a.action}</div>
                    <div className="mt-1 font-medium">{a.problem}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {a.detail}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{a.time}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

import { BrainCircuit } from "lucide-react"

export interface BrandProps {
  compact?: boolean
}

export function Brand({ compact = false }: BrandProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
        <BrainCircuit className="size-5" />
      </div>
      {!compact && (
        <div>
          <div className="font-bold tracking-tight">DSA Mastery</div>
          <div className="text-xs text-muted-foreground">
            Learn. Revise. Master.
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { cn } from "@/lib/utils"

interface PriorityRow {
  key:   string
  total: number
  done:  number
}

interface Props {
  byPriority: Record<string, { total: number; done: number }>
}

const PRIORITY_META: Record<string, { label: string; color: string; bg: string }> = {
  fire:   { label: "🔥 Must-do",      color: "bg-orange-500", bg: "bg-orange-100 dark:bg-orange-950" },
  high:   { label: "High priority",   color: "bg-blue-500",   bg: "bg-blue-100 dark:bg-blue-950"   },
  medium: { label: "Medium priority", color: "bg-teal-500",   bg: "bg-teal-100 dark:bg-teal-950"   },
  low:    { label: "Low priority",    color: "bg-zinc-400",   bg: "bg-zinc-100 dark:bg-zinc-800"   },
}

export function SubjectBreakdown({ byPriority }: Props) {
  const rows: PriorityRow[] = ["fire", "high", "medium", "low"]
    .filter((k) => byPriority[k])
    .map((k) => ({ key: k, ...byPriority[k] }))

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row) => {
        const pct  = Math.round((row.done / row.total) * 100)
        const meta = PRIORITY_META[row.key]
        return (
          <div key={row.key}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full flex-shrink-0", meta.color)} />
                <span className="text-sm font-medium">{meta.label}</span>
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">
                {row.done}/{row.total}  · 
                <span className="font-medium text-foreground">{pct}%</span>
              </span>
            </div>
            <div className={cn("h-2 rounded-full overflow-hidden", meta.bg)}>
              <div
                className={cn("h-full rounded-full transition-all duration-700", meta.color)}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
"use client"

import { cn } from "@/lib/utils"
import { AlertTriangle } from "lucide-react"

interface WeakChapter { id: string; name: string; scorePct: number }
interface Props { chapters: WeakChapter[] }

function scoreLabel(s: number) {
  if (s < 30) return { text: "Critical", cls: "text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400" }
  if (s < 50) return { text: "Weak",     cls: "text-orange-600 bg-orange-50 dark:bg-orange-950 dark:text-orange-400" }
  return       { text: "Below 60", cls: "text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400" }
}

export function WeakChapters({ chapters }: Props) {
  if (!chapters.length) return (
    <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
      <span className="text-2xl">🎉</span>
      <p className="text-sm font-medium">No weak chapters!</p>
      <p className="text-xs text-muted-foreground">
        All scored chapters are above 60%. Keep it up.
      </p>
    </div>
  )

  return (
    <div className="flex flex-col gap-1">
      {chapters.map((ch) => {
        const { text, cls } = scoreLabel(ch.scorePct)
        return (
          <div
            key={ch.id}
            className="flex items-center justify-between gap-3 px-3 py-2.5
                       rounded-lg hover:bg-muted/40 transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
              <span className="text-sm truncate">{ch.name}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-red-400"
                  style={{ width: `${ch.scorePct}%` }}
                />
              </div>
              <span className={cn("text-[11px] font-medium px-1.5 py-0.5 rounded-md min-w-[4rem] text-center", cls)}>
                {text} · {ch.scorePct}%
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
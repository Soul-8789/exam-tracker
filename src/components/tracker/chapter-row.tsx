"use client"

import { Badge } from "@/components/ui/badge"
import { StatusSelect, type Status } from "./status-select"
import { ScoreInput } from "./score-input"
import { useUpdateProgress } from "@/hooks/use-progress"
import { cn } from "@/lib/utils"
import type { Chapter, UserProgress } from "@/lib/types"

type ChapterWithProgress = Chapter & { progress: UserProgress | null }

const PRIORITY_CONFIG = {
  fire:   { label: "🔥 Must",  class: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border-orange-200 dark:border-orange-800" },
  high:   { label: "High",     class: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
  medium: { label: "Medium",   class: "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border-teal-200 dark:border-teal-800" },
  low:    { label: "Low",      class: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700" },
} as const

interface Props {
  chapter:   ChapterWithProgress
  subjectId: string
  index:     number
}

export function ChapterRow({ chapter, subjectId, index }: Props) {
  const { mutate, isPending } = useUpdateProgress(subjectId)
  const p = chapter.progress
  const status = (p?.status ?? "todo") as Status
  const score  = p?.scorePct ? parseFloat(p.scorePct) : null
  const cfg    = PRIORITY_CONFIG[chapter.priority as keyof typeof PRIORITY_CONFIG]

  const update = (patch: Partial<Omit<Parameters<typeof mutate>[0], "chapterId">>) =>
    mutate({ chapterId: chapter.id, ...patch })

  return (
    <div
      className={cn(
        "group grid items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent",
        "hover:bg-muted/40 hover:border-border/60 transition-all duration-150",
        status === "done" && "opacity-60 hover:opacity-100",
        isPending && "opacity-70 pointer-events-none"
      )}
      style={{ gridTemplateColumns: "2rem 1fr 6rem 5rem 9rem 5.5rem" }}
    >
      {/* Index */}
      <span className="text-xs tabular-nums text-muted-foreground/50 text-right select-none">
        {index + 1}
      </span>

      {/* Name + pages */}
      <div className="flex flex-col min-w-0">
        <span className={cn(
          "text-sm font-medium leading-snug truncate",
          status === "done" && "line-through text-muted-foreground"
        )}>
          {chapter.name}
        </span>
        <span className="text-[11px] text-muted-foreground/60 font-mono mt-0.5">
          pg {chapter.pageRange}
          {(chapter.expectedQs ?? 0) > 0 && (
  <span className="ml-2 text-muted-foreground/40">~{chapter.expectedQs}Q</span>
)}

        </span>
      </div>

      {/* Section tag */}
      <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wide truncate">
        {chapter.section}
      </span>

      {/* Priority badge */}
      <Badge
        variant="outline"
        className={cn("text-[11px] px-2 py-0.5 font-medium w-fit", cfg?.class)}>
        {cfg?.label}
      </Badge>

      {/* Status dropdown — optimistic */}
      <StatusSelect
        value={status}
        onChange={(v) => update({ status: v })}
        disabled={isPending}
      />

      {/* Score input + bar */}
      <ScoreInput
        value={score}
        onChange={(v) => update({ scorePct: v ?? undefined })}
      />
    </div>
  )
}
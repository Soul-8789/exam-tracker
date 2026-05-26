"use client"

import { useMemo } from "react"
import { useChapters } from "@/hooks/use-progress"
import { useTrackerStore } from "@/store/tracker-store"
import { ChapterRow } from "./chapter-row"
import { FilterBar } from "./filter-bar"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

interface Props { subjectId: string }

export function ChapterList({ subjectId }: Props) {
  const { data, isLoading, isError } = useChapters(subjectId)
  const { search, filterStatus, filterPriority } = useTrackerStore()

  // Client-side filtering — fast, no extra API calls
  const filtered = useMemo(() => {
    if (!data) return []
    return data.filter((ch: any) => {
      const status   = ch.progress?.status ?? "todo"
      const matchS   = filterStatus   === "all" || status === filterStatus
      const matchP   = filterPriority === "all" || ch.priority === filterPriority
      const matchQ   = !search || ch.name.toLowerCase().includes(search.toLowerCase())
      return matchS && matchP && matchQ
    })
  }, [data, search, filterStatus, filterPriority])

  // Group by section
  const grouped = useMemo(() => {
    const map = new Map<string, any[]>()
    filtered.forEach((ch: any) => {
      const sec = ch.section ?? "other"
      if (!map.has(sec)) map.set(sec, [])
      map.get(sec)!.push(ch)
    })
    return map
  }, [filtered])

  // Completion stats
  const stats = useMemo(() => {
    if (!data) return null
    const done = data.filter((c: any) =>
      c.progress?.status === "done" || c.progress?.status === "revision"
    ).length
    return { done, total: data.length, pct: Math.round(done / data.length * 100) }
  }, [data])

  if (isLoading) return (
    <div className="space-y-2 mt-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  )

  if (isError) return (
    <p className="mt-4 text-sm text-destructive">
      Failed to load chapters. Please refresh.
    </p>
  )

  return (
    <div className="flex flex-col gap-4">

      {/* Completion bar */}
      {stats && (
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${stats.pct}%` }}
            />
          </div>
          <span className="text-xs tabular-nums text-muted-foreground whitespace-nowrap">
            {stats.done}/{stats.total}  ·  {stats.pct}%
          </span>
        </div>
      )}

      <FilterBar />

      {/* Column headers */}
      <div
        className="grid text-[10px] uppercase tracking-widest text-muted-foreground/50 px-3 select-none"
        style={{ gridTemplateColumns: "2rem 1fr 6rem 5rem 9rem 5.5rem" }}>
        <span />
        <span>Chapter</span>
        <span>Section</span>
        <span>Priority</span>
        <span>Status</span>
        <span className="text-center">Score %</span>
      </div>

      {/* Chapter rows grouped by section */}
      {[...grouped.entries()].map(([section, chs]) => (
        <div key={section} className="flex flex-col gap-0.5">
          <p className="px-3 mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
            {section}
          </p>
          {chs.map((ch: any, i: number) => (
            <ChapterRow
              key={ch.id}
              chapter={ch}
              subjectId={subjectId}
              index={i}
            />
          ))}
          <Separator className="mt-2 opacity-40" />
        </div>
      ))}

      {filtered.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-12">
          No chapters match your filters.
        </p>
      )}
    </div>
  )
}
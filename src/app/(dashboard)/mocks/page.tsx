"use client"

import { useMemo } from "react"
import { useMocks } from "@/hooks/use-mocks"
import { useExams } from "@/hooks/use-progress"
import { AddMockDialog } from "@/components/mocks/add-mock-dialog"
import { MockTable } from "@/components/mocks/mock-table"
import { MockScoreBadge } from "@/components/mocks/mock-score-badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TooltipProvider } from "@/components/ui/tooltip"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export default function MocksPage() {
  const { data: mocks,  isLoading: mocksLoading }  = useMocks()
  const { data: exams,  isLoading: examsLoading }  = useExams()

  // Use the first active exam for the "Log mock" dialog
  const activeExamId = exams?.[0]?.id

  // Compute summary stats from mock history
  const stats = useMemo(() => {
    if (!mocks?.length) return null
    const scores = mocks
      .filter((m) => m.totalScore)
      .map((m) => parseFloat(m.totalScore!))

    if (!scores.length) return null

    const best    = Math.max(...scores)
    const latest  = scores[0]
    const prev    = scores[1] ?? null
    const avg     = scores.reduce((a, b) => a + b, 0) / scores.length
    const trend   = prev !== null ? latest - prev : null

    return { best, latest, avg: Math.round(avg * 10) / 10, trend, total: mocks.length }
  }, [mocks])

  if (mocksLoading || examsLoading) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6 max-w-5xl">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Mock log</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track every mock attempt and monitor your score trend
            </p>
          </div>
          {activeExamId && <AddMockDialog examId={activeExamId} />}
        </div>

        {/* Summary stat cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            <div className="rounded-xl border border-border/60 bg-card px-4 py-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Total attempts
              </p>
              <p className="text-3xl font-bold mt-1.5 tabular-nums">{stats.total}</p>
            </div>

            <div className="rounded-xl border border-border/60 bg-card px-4 py-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Latest score
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <p className="text-3xl font-bold tabular-nums">{stats.latest}</p>
                {stats.trend !== null && (
                  <span className={
                    stats.trend > 0 ? "text-emerald-500 text-xs flex items-center gap-0.5"
                  : stats.trend < 0 ? "text-red-500 text-xs flex items-center gap-0.5"
                  :                    "text-muted-foreground text-xs flex items-center gap-0.5"
                  }>
                    {stats.trend > 0 ? <TrendingUp className="h-3 w-3" />
                   : stats.trend < 0 ? <TrendingDown className="h-3 w-3" />
                   :                   <Minus className="h-3 w-3" />}
                    {stats.trend > 0 ? `+${stats.trend.toFixed(1)}` : stats.trend.toFixed(1)}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">vs previous mock</p>
            </div>

            <div className="rounded-xl border border-border/60 bg-card px-4 py-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Best score
              </p>
              <p className="text-3xl font-bold tabular-nums text-emerald-600
                             dark:text-emerald-400 mt-1.5">
                {stats.best}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">out of 200</p>
            </div>

            <div className="rounded-xl border border-border/60 bg-card px-4 py-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Average score
              </p>
              <p className="text-3xl font-bold tabular-nums text-blue-600
                             dark:text-blue-400 mt-1.5">
                {stats.avg}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${(stats.avg / 200) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  / 200
                </span>
              </div>
            </div>

          </div>
        )}

        {/* Cutoff guide */}
        <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Cutoff guide:</span>
          {[
            { label: "UR ~136",  color: "bg-emerald-500" },
            { label: "OBC ~130", color: "bg-blue-500"    },
            { label: "SC ~120",  color: "bg-amber-500"   },
            { label: "ST ~110",  color: "bg-orange-500"  },
          ].map((c) => (
            <span key={c.label} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${c.color}`} />
              {c.label}
            </span>
          ))}
        </div>

        {/* Table */}
        <MockTable mocks={mocks ?? []} />

      </div>
    </TooltipProvider>
  )
}
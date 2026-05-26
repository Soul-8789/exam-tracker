"use client"

import { useAnalytics } from "@/hooks/use-analytics"
import { CompletionRing } from "@/components/analytics/completion-ring"
import { ScoreTrendChart } from "@/components/analytics/score-trend-chart"
import { SubjectBreakdown } from "@/components/analytics/subject-breakdown"
import { WeakChapters } from "@/components/analytics/weak-chapters"
import { StatCard } from "@/components/analytics/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function AnalyticsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-40" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="lg:col-span-2 h-64 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const { data, isLoading, isError } = useAnalytics()

  if (isLoading) return <AnalyticsSkeleton />

  if (isError || !data) return (
    <div className="p-6 text-sm text-destructive">
      Failed to load analytics. Please refresh.
    </div>
  )

  const statusRows = [
    { label: "Done",        value: data.done,       color: "green" as const, icon: "✅" },
    { label: "In Progress",  value: data.inProgress,  color: "blue"  as const, icon: "📖" },
    { label: "Revision",     value: data.revision,    color: "amber" as const, icon: "🔁" },
    { label: "Pending",      value: data.todo,        color: "default" as const, icon: "📋" },
  ]

  return (
    <div className="p-6 space-y-6 max-w-6xl">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your preparation overview across all chapters
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statusRows.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            sub={`of ${data.totalChapters} chapters`}
            icon={s.icon}
            color={s.color}
          />
        ))}
      </div>

      {/* Ring + score trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall completion</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 pb-6">
            <CompletionRing
              pct={data.completionPct}
              size={160}
              label="chapters completed"
            />
            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="text-center p-2 rounded-lg bg-muted/40">
                <p className="text-lg font-bold tabular-nums text-blue-500">
                  {data.avgScore !== null ? `${data.avgScore}%` : "—"}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Avg score</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/40">
                <p className="text-lg font-bold tabular-nums text-amber-500">
                  {data.totalStudyHours}h
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Study hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mock score trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreTrendChart data={data.mockHistory} cutoff={68} />
          </CardContent>
        </Card>

      </div>

      {/* Priority breakdown + weak chapters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Priority breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <SubjectBreakdown byPriority={data.byPriority} />
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Weak chapters
              {data.weakChapters.length > 0 && (
                <span className="text-[11px] font-normal px-1.5 py-0.5 rounded-md
                               bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
                  {data.weakChapters.length} below 60%
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WeakChapters chapters={data.weakChapters} />
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
"use client"

import { useToggleSession, useDeleteSession } from "@/hooks/use-planner"
import { cn } from "@/lib/utils"
import { CheckCircle2, Circle, Trash2, Clock, BookOpen } from "lucide-react"

const COLOR_MAP: Record<string, string> = {
  blue:   "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/30",
  green:  "border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30",
  purple: "border-l-violet-500 bg-violet-50/50 dark:bg-violet-950/30",
  orange: "border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/30",
  pink:   "border-l-pink-500 bg-pink-50/50 dark:bg-pink-950/30",
  teal:   "border-l-teal-500 bg-teal-50/50 dark:bg-teal-950/30",
}

interface Session {
  id: string; title: string; startTime?: string
  durationMins: number; isCompleted: boolean; color: string
}

interface Props {
  sessions:   Session[]
  weekStart:  string
  goalHours:  number
}

export function DailyGoals({ sessions, weekStart, goalHours }: Props) {
  const { mutate: toggle }  = useToggleSession(weekStart)
  const { mutate: remove }  = useDeleteSession(weekStart)

  const today     = new Date().toISOString().slice(0, 10)
  const todaySess = sessions.filter(s => s.date === today || !s.date)
  const doneMins  = todaySess.filter(s => s.isCompleted)
    .reduce((a, s) => a + (s.durationMins ?? 0), 0)
  const targetMins = goalHours * 60
  const pct        = Math.min(100, Math.round((doneMins / targetMins) * 100))
  const doneCount  = todaySess.filter(s => s.isCompleted).length

  return (
    <div className="space-y-4">

      {/* Daily progress header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">
            {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" })}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {doneCount}/{todaySess.length} sessions  ·  {doneMins}m / {targetMins}m
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums"
             style={{ color: pct >= 100 ? "#22c55e" : pct >= 50 ? "#3b82f6" : "#f59e0b" }}>
            {pct}%
          </p>
          <p className="text-[10px] text-muted-foreground">daily goal</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: pct >= 100 ? "#22c55e" : pct >= 50 ? "#3b82f6" : "#f59e0b"
          }}
        />
      </div>

      {/* Session checklist */}
      {todaySess.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          No sessions planned for today.

          <span className="text-xs">Use Smart Schedule or add a session manually.</span>
        </div>
      ) : (
        <div className="space-y-2">
          {todaySess.map((s) => (
            <div key={s.id} className={cn(
              "group flex items-center gap-3 px-3 py-2.5 rounded-lg",
              "border-l-4 border border-border/40 transition-all",
              COLOR_MAP[s.color] ?? COLOR_MAP.blue,
              s.isCompleted && "opacity-60"
            )}>
              <button type="button" onClick={() => toggle({ id: s.id, isCompleted: !s.isCompleted })}>
                {s.isCompleted
                  ? <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  : <Circle className="h-5 w-5 text-muted-foreground/40 flex-shrink-0 hover:text-foreground" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium truncate", s.isCompleted && "line-through text-muted-foreground")}>
                  {s.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {s.startTime && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />{s.startTime}
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <BookOpen className="h-2.5 w-2.5" />{s.durationMins}m
                  </span>
                </div>
              </div>
              <button type="button"
                className="opacity-0 group-hover:opacity-100 text-muted-foreground
                           hover:text-destructive transition-all p-1 rounded"
                onClick={() => remove(s.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
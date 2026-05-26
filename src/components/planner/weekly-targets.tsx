"use client"

import { cn } from "@/lib/utils"

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]

interface Session { date: string; isCompleted: boolean; durationMins: number }

interface Props {
  sessions:          Session[]
  weekStart:         string
  goalHoursPerDay:   number
  goalChaptersWeekly:number
}

export function WeeklyTargets({ sessions, weekStart, goalHoursPerDay, goalChaptersWeekly }: Props) {
  const start = new Date(weekStart)
  const today = new Date().toISOString().slice(0,10)

  const days = DAYS.map((label, i) => {
    const d    = new Date(start)
    d.setDate(d.getDate() + i)
    const ds   = d.toISOString().slice(0,10)
    const daySessions = sessions.filter(s => s.date === ds)
    const doneMins    = daySessions.filter(s => s.isCompleted).reduce((a,s) => a+s.durationMins,0)
    const pct         = Math.min(100, Math.round((doneMins / (goalHoursPerDay*60)) * 100))
    return { label, date: ds, pct, doneMins, total: daySessions.length,
             isToday: ds === today, isPast: ds < today }
  })

  const weekDone     = sessions.filter(s => s.isCompleted).length
  const weekPct      = Math.min(100, Math.round((weekDone / goalChaptersWeekly) * 100))
  const totalHours   = sessions.filter(s => s.isCompleted).reduce((a,s) => a+s.durationMins,0) / 60

  return (
    <div className="space-y-5">

      {/* Weekly summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Sessions done", value: weekDone,                     color: "text-emerald-500" },
          { label: "Weekly target", value: `${weekPct}%`,              color: "text-blue-500"    },
          { label: "Hours studied", value: `${totalHours.toFixed(1)}h`, color: "text-amber-500"   },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-muted/40 px-3 py-3 text-center">
            <p className={cn("text-2xl font-bold tabular-nums", s.color)}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Day-by-day bars */}
      <div className="grid grid-cols-7 gap-2">
        {days.map(d => (
          <div key={d.date} className="flex flex-col items-center gap-1.5">
            <div className="relative w-full h-24 bg-muted/30 rounded-lg overflow-hidden flex items-end">
              <div
                className={cn(
                  "w-full rounded-lg transition-all duration-700",
                  d.pct >= 100 ? "bg-emerald-500"
                : d.pct >=  50 ? "bg-blue-500"
                : d.pct >   0  ? "bg-amber-500"
                :                 "bg-transparent"
                )}
                style={{ height: `${Math.max(d.pct, 0)}%` }}
              />
              {d.isToday && (
                <div className="absolute inset-x-0 top-0 h-0.5 bg-primary rounded-t-lg" />
              )}
            </div>
            <p className={cn(
              "text-[10px] font-medium",
              d.isToday ? "text-primary" : "text-muted-foreground"
            )}>{d.label}</p>
            <p className="text-[10px] text-muted-foreground/60 tabular-nums">
              {d.doneMins > 0 ? `${d.doneMins}m` : "—"}
            </p>
          </div>
        ))}
      </div>

      {/* Weekly chapters progress bar */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Weekly chapter target</span>
          <span className="font-medium text-foreground">
            {weekDone} / {goalChaptersWeekly} sessions
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-emerald-500 transition-all duration-700"
               style={{ width: `${weekPct}%` }} />
        </div>
      </div>
    </div>
  )
}
"use client"

import { useState } from "react"
import { useSmartSchedule, useCreateSession } from "@/hooks/use-planner"
import { useExams } from "@/hooks/use-progress"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Sparkles, Calendar, CheckCircle2, ChevronRight } from "lucide-react"

const COLOR_DOT: Record<string,string> = {
  blue:"bg-blue-500", green:"bg-emerald-500", purple:"bg-violet-500",
  orange:"bg-orange-500", pink:"bg-pink-500", teal:"bg-teal-500",
}

interface Props { weekStart: string }

export function SmartSchedule({ weekStart }: Props) {
  const [days, setDays]       = useState(7)
  const [preview, setPreview] = useState<any[] | null>(null)
  const [saved, setSaved]     = useState(false)
  const { data: exams }       = useExams()
  const { mutate: generate, isPending } = useSmartSchedule()
  const { mutate: create }    = useCreateSession(weekStart)

  const handleGenerate = () => {
    setSaved(false)
    generate({ days }, {
      onSuccess: (res) => setPreview(res.schedule),
    })
  }

  const handleSaveAll = () => {
    if (!preview?.length) return
    let saved = 0
    preview.forEach(s => {
      create(s, { onSuccess: () => { saved++; if (saved === preview!.length) setSaved(true) } })
    })
  }

  // Group preview by date for display
  const grouped = preview ? preview.reduce((acc: any, s) => {
    if (!acc[s.date]) acc[s.date] = []
    acc[s.date].push(s); return acc
  }, {}) : {}

  return (
    <div className="space-y-5">

      {/* Controls */}
      <div className="rounded-xl border border-border/60 bg-gradient-to-br
                      from-violet-50/50 to-blue-50/50 dark:from-violet-950/20 dark:to-blue-950/20 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-violet-500" />
          <h3 className="font-semibold text-sm">Smart schedule generator</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Automatically plans your pending chapters by priority — fire-priority and weak chapters
          (low score) are scheduled first, distributed across your available study days.
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Plan next</span>
            {[7,14,21].map(d => (
              <button key={d} type="button"
                onClick={() => setDays(d)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium border transition-all",
                  days === d
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                )}>
                {d} days
              </button>
            ))}
          </div>
          <Button size="sm" onClick={handleGenerate} disabled={isPending}
            className="ml-auto gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            {isPending ? "Generating…" : "Generate"}
          </Button>
        </div>
      </div>

      {/* Preview */}
      {preview !== null && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Preview — {preview.length} sessions across {days} days
            </p>
            {saved ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> Added to timetable
              </span>
            ) : (
              <Button size="sm" variant="outline" onClick={handleSaveAll}
                className="gap-1.5 text-xs">
                <Calendar className="h-3.5 w-3.5" /> Save to timetable
              </Button>
            )}
          </div>

          {preview.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              🎉 No pending chapters! Everything is in progress or done.
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {Object.entries(grouped).map(([date, sessions]: [string, any]) => (
                <div key={date}>
                  <p className="text-[10px] font-medium uppercase tracking-wider
                               text-muted-foreground mb-1.5">
                    {new Date(date).toLocaleDateString("en-IN",
                      { weekday:"long", day:"numeric", month:"short" })}
                  </p>
                  <div className="space-y-1 ml-2">
                    {sessions.map((s: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-xs
                                               text-muted-foreground py-1">
                        <ChevronRight className="h-3 w-3 flex-shrink-0" />
                        <span className={cn("w-2 h-2 rounded-full flex-shrink-0",
                          COLOR_DOT[s.color] ?? "bg-blue-500")} />
                        <span className="flex-1 truncate text-foreground font-medium">{s.title}</span>
                        <span className="tabular-nums">{s.startTime} · {s.durationMins}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
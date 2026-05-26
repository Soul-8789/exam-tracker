"use client"

import { useState } from "react"
import { useCreateSession, useDeleteSession } from "@/hooks/use-planner"
import { cn } from "@/lib/utils"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const DAYS  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
const HOURS = Array.from({ length: 16 }, (_, i) => i + 5) // 5am – 8pm
const COLORS = ["blue","green","purple","orange","pink","teal"]

const CELL_COLOR: Record<string,string> = {
  blue:   "bg-blue-200/80 dark:bg-blue-800/60 text-blue-900 dark:text-blue-100",
  green:  "bg-emerald-200/80 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-100",
  purple: "bg-violet-200/80 dark:bg-violet-800/60 text-violet-900 dark:text-violet-100",
  orange: "bg-orange-200/80 dark:bg-orange-800/60 text-orange-900 dark:text-orange-100",
  pink:   "bg-pink-200/80 dark:bg-pink-800/60 text-pink-900 dark:text-pink-100",
  teal:   "bg-teal-200/80 dark:bg-teal-800/60 text-teal-900 dark:text-teal-100",
}

interface Props {
  sessions:  any[]
  weekStart: string
}

export function Timetable({ sessions, weekStart }: Props) {
  const [adding, setAdding]   = useState<{ date: string; hour: number } | null>(null)
  const [title, setTitle]     = useState("")
  const [color, setColor]     = useState("blue")
  const { mutate: create, isPending } = useCreateSession(weekStart)
  const { mutate: remove }    = useDeleteSession(weekStart)

  const start = new Date(weekStart)

  const getDate = (dayIdx: number) => {
    const d = new Date(start); d.setDate(d.getDate() + dayIdx)
    return d.toISOString().slice(0,10)
  }

  const getSessionsAt = (date: string, hour: number) =>
    sessions.filter(s => s.date === date &&
      s.startTime && parseInt(s.startTime.split(":")[0]) === hour)

  const commitAdd = () => {
    if (!adding || !title.trim()) return
    const h = String(adding.hour).padStart(2,"0")
    create({
      title: title.trim(), date: adding.date,
      startTime: `${h}:00`, endTime: `${String(adding.hour+1).padStart(2,"0")}:00`,
      durationMins: 60, color,
    }, {
      onSuccess: () => { setAdding(null); setTitle("") }
    })
  }

  return (
    <div className="overflow-auto rounded-xl border border-border/60">
      <div style={{ minWidth: "640px" }}>

        {/* Header row */}
        <div className="grid border-b border-border/60 bg-muted/20"
             style={{ gridTemplateColumns: "3rem repeat(7, 1fr)" }}>
          <div className="p-2" />
          {DAYS.map((d, i) => {
            const date  = getDate(i)
            const isT   = date === new Date().toISOString().slice(0,10)
            return (
              <div key={d} className={cn(
                "p-2 text-center text-xs font-medium border-l border-border/40",
                isT && "text-primary"
              )}>
                <p>{d}</p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(date).getDate()}
                </p>
              </div>
            )
          })}
        </div>

        {/* Time rows */}
        {HOURS.map(hour => (
          <div key={hour} className="grid border-b border-border/30"
               style={{ gridTemplateColumns: "3rem repeat(7, 1fr)", minHeight: "3rem" }}>
            <div className="flex items-start justify-end pr-2 pt-1">
              <span className="text-[10px] text-muted-foreground/50">
                {String(hour).padStart(2,"0")}:00
              </span>
            </div>
            {DAYS.map((_, i) => {
              const date = getDate(i)
              const cell = getSessionsAt(date, hour)
              const isAddingThis = adding?.date === date && adding?.hour === hour

              return (
                <div key={i}
                  className="border-l border-border/30 p-0.5 min-h-[3rem] relative group cursor-pointer
                             hover:bg-muted/20 transition-colors"
                  onClick={() => !isAddingThis && cell.length === 0 && setAdding({ date, hour })}>

                  {cell.map(s => (
                    <div key={s.id} className={cn(
                      "rounded px-1.5 py-1 text-[11px] font-medium flex items-center justify-between gap-1",
                      CELL_COLOR[s.color] ?? CELL_COLOR.blue,
                      s.isCompleted && "opacity-50 line-through"
                    )}>
                      <span className="truncate">{s.title}</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); remove(s.id) }}>
                        <X className="h-3 w-3 opacity-60 hover:opacity-100" />
                      </button>
                    </div>
                  ))}

                  {isAddingThis ? (
                    <div className="absolute inset-0 z-10 bg-background/95 p-1.5 rounded flex flex-col gap-1"
                         onClick={e => e.stopPropagation()}>
                      <Input autoFocus value={title} onChange={e => setTitle(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && commitAdd()}
                        placeholder="Session name..." className="h-6 text-xs px-1.5" />
                      <div className="flex items-center gap-1">
                        {COLORS.map(c => (
                          <button key={c} type="button"
                            className={cn("w-4 h-4 rounded-full transition-transform",
                              CELL_COLOR[c].split(" ")[0],
                              color === c && "scale-125 ring-2 ring-offset-1 ring-foreground"
                            )}
                            onClick={() => setColor(c)} />
                        ))}
                        <button type="button" onClick={() => setAdding(null)}
                          className="ml-auto text-muted-foreground hover:text-foreground">
                          <X className="h-3 w-3" />
                        </button>
                        <button type="button" onClick={commitAdd} disabled={isPending}>
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ) : cell.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center
                                    opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="h-3.5 w-3.5 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
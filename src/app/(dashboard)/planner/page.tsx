"use client"

import { useState } from "react"
import { usePlannerWeek, weekKey, useSaveGoals } from "@/hooks/use-planner"
import { DailyGoals }    from "@/components/planner/daily-goals"
import { WeeklyTargets } from "@/components/planner/weekly-targets"
import { Timetable }     from "@/components/planner/timetable"
import { SmartSchedule } from "@/components/planner/smart-schedule"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"

const STUDY_DAYS = [
  { label: "Mon", value: 1 }, { label: "Tue", value: 2 },
  { label: "Wed", value: 3 }, { label: "Thu", value: 4 },
  { label: "Fri", value: 5 }, { label: "Sat", value: 6 },
  { label: "Sun", value: 0 },
]

export default function PlannerPage() {
  const [weekStart, setWeekStart] = useState(() => weekKey(new Date()))
  const [showGoals, setShowGoals] = useState(false)
  const { data, isLoading }       = usePlannerWeek(weekStart)
  const { mutate: saveGoals, isPending: savingGoals } = useSaveGoals()

  const goals    = data?.goals
  const sessions = data?.sessions ?? []

  // Local goal form state
  const [goalForm, setGoalForm] = useState({
    dailyHoursTarget:     goals?.dailyHoursTarget     ?? 3,
    weeklyChaptersTarget: goals?.weeklyChaptersTarget  ?? 5,
    preferredStartTime:   goals?.preferredStartTime    ?? "06:00",
    sessionLengthMins:    goals?.sessionLengthMins     ?? 60,
    breakLengthMins:      goals?.breakLengthMins       ?? 15,
    studyDays:            (goals?.studyDays as number[] | null) ?? [1,2,3,4,5,6],
  })

  const shiftWeek = (n: number) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + n * 7)
    setWeekStart(d.toISOString().slice(0,10))
  }

  const toggleDay = (v: number) =>
    setGoalForm(f => ({
      ...f,
      studyDays: f.studyDays.includes(v)
        ? f.studyDays.filter(d => d !== v)
        : [...f.studyDays, v]
    }))

  const weekLabel = () => {
    const s = new Date(weekStart)
    const e = new Date(s); e.setDate(e.getDate() + 6)
    return `${s.toLocaleDateString("en-IN",{day:"numeric",month:"short"})} – ${e.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}`
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 flex-shrink-0">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Study Planner</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {goals
              ? `Daily goal: ${goals.dailyHoursTarget}h · Weekly: ${goals.weeklyChaptersTarget} sessions`
              : "Set your daily and weekly goals below"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => shiftWeek(-1)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium min-w-[180px] text-center">{weekLabel()}</span>
          <button type="button" onClick={() => shiftWeek(1)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setShowGoals(!showGoals)}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              showGoals ? "bg-muted text-foreground" : "hover:bg-muted text-muted-foreground"
            )}>
            <Settings2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Goals panel (collapsible) */}
      {showGoals && (
        <div className="border-b border-border/60 px-6 py-4 bg-muted/20 flex-shrink-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Study preferences
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Daily hours target</Label>
              <Input type="number" min={1} max={12} className="h-8 text-sm"
                value={goalForm.dailyHoursTarget}
                onChange={e => setGoalForm(f => ({ ...f, dailyHoursTarget: +e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Weekly sessions target</Label>
              <Input type="number" min={1} max={50} className="h-8 text-sm"
                value={goalForm.weeklyChaptersTarget}
                onChange={e => setGoalForm(f => ({ ...f, weeklyChaptersTarget: +e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Session length (mins)</Label>
              <Input type="number" min={15} max={180} step={15} className="h-8 text-sm"
                value={goalForm.sessionLengthMins}
                onChange={e => setGoalForm(f => ({ ...f, sessionLengthMins: +e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Start time</Label>
              <Input type="time" className="h-8 text-sm"
                value={goalForm.preferredStartTime}
                onChange={e => setGoalForm(f => ({ ...f, preferredStartTime: e.target.value }))} />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-xs">Study days:</Label>
              <div className="flex gap-1">
                {STUDY_DAYS.map(d => (
                  <button key={d.value} type="button" onClick={() => toggleDay(d.value)}
                    className={cn(
                      "w-8 h-8 rounded-full text-xs font-medium border transition-all",
                      goalForm.studyDays.includes(d.value)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-foreground/30"
                    )}>
                    {d.label[0]}
                  </button>
                ))}
              </div>
            </div>
            <Button size="sm" onClick={() => saveGoals(goalForm)} disabled={savingGoals}>
              {savingGoals ? "Saving…" : "Save preferences"}
            </Button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        ) : (
          <Tabs defaultValue="today" className="h-full">
            <div className="px-6 pt-4 border-b border-border/40">
              <TabsList className="h-9">
                <TabsTrigger value="today"   className="text-xs">📋 Today</TabsTrigger>
                <TabsTrigger value="week"    className="text-xs">📊 Weekly</TabsTrigger>
                <TabsTrigger value="timetable" className="text-xs">🗓 Timetable</TabsTrigger>
                <TabsTrigger value="smart"   className="text-xs">✨ Smart</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="today" className="p-6 mt-0">
              <DailyGoals
                sessions={sessions}
                weekStart={weekStart}
                goalHours={goals?.dailyHoursTarget ?? 3}
              />
            </TabsContent>

            <TabsContent value="week" className="p-6 mt-0">
              <WeeklyTargets
                sessions={sessions}
                weekStart={weekStart}
                goalHoursPerDay={goals?.dailyHoursTarget ?? 3}
                goalChaptersWeekly={goals?.weeklyChaptersTarget ?? 5}
              />
            </TabsContent>

            <TabsContent value="timetable" className="p-4 mt-0">
              <Timetable sessions={sessions} weekStart={weekStart} />
            </TabsContent>

            <TabsContent value="smart" className="p-6 mt-0">
              <SmartSchedule weekStart={weekStart} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
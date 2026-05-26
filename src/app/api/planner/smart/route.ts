import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { chapters, userProgress, plannerGoals } from "@/db/schema"
import { eq } from "drizzle-orm"

// POST /api/planner/smart
// Generates a smart study schedule for the next N days
// based on pending chapters, priority, user goals, and exam date
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const { days = 7, subjectId } = await req.json()

  // Fetch everything in parallel
  const [allChapters, progressRows, goalsRows] = await Promise.all([
    db.select().from(chapters)
      .where(subjectId ? eq(chapters.subjectId, subjectId) : undefined),
    db.select().from(userProgress).where(eq(userProgress.userId, userId)),
    db.select().from(plannerGoals).where(eq(plannerGoals.userId, userId)).limit(1),
  ])

  const goals       = goalsRows[0]
  const progressMap = new Map(progressRows.map(p => [p.chapterId, p]))
  const studyDays   = (goals?.studyDays as number[] | null) ?? [1,2,3,4,5,6]
  const sessionMins = goals?.sessionLengthMins ?? 60
  const startHour   = parseInt((goals?.preferredStartTime ?? "06:00").split(":")[0])

  // Priority order: fire → high → medium → low
  // Within same priority: sort by lowest score first (weakest chapters first)
  const PRIORITY_WEIGHT = { fire: 4, high: 3, medium: 2, low: 1 }

  const pending = allChapters
    .filter(ch => {
      const p = progressMap.get(ch.id)
      return !p || p.status === "todo" || p.status === "in_progress"
    })
    .map(ch => ({
      ...ch,
      score:          parseFloat(progressMap.get(ch.id)?.scorePct ?? "100"),
      priorityWeight: PRIORITY_WEIGHT[ch.priority as keyof typeof PRIORITY_WEIGHT] ?? 1,
    }))
    .sort((a, b) => {
      if (b.priorityWeight !== a.priorityWeight) return b.priorityWeight - a.priorityWeight
      return a.score - b.score  // weakest first within same priority
    })

  // Build schedule: assign chapters to available study slots
  const schedule: Array<{
    title: string; chapterId: string; date: string
    startTime: string; endTime: string; durationMins: number; color: string
  }> = []

  const COLORS = ["blue", "green", "purple", "orange", "pink", "teal"]
  let chapterIdx = 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let d = 0; d < days && chapterIdx < pending.length; d++) {
    const dayDate = new Date(today)
    dayDate.setDate(dayDate.getDate() + d)
    const dow = dayDate.getDay()

    if (!studyDays.includes(dow)) continue  // skip non-study days

    const dateStr   = dayDate.toISOString().slice(0, 10)
    const dailyGoalHours = goals?.dailyHoursTarget ?? 3
    const maxSessionsPerDay = Math.floor((dailyGoalHours * 60) / sessionMins)
    let   currentHour = startHour

    for (let s = 0; s < maxSessionsPerDay && chapterIdx < pending.length; s++) {
      const ch        = pending[chapterIdx++]
      const startH    = String(currentHour).padStart(2, "0") + ":00"
      const endH      = String(currentHour + Math.floor(sessionMins / 60)).padStart(2, "0") + ":00"
      currentHour    += Math.ceil(sessionMins / 60) + (goals?.breakLengthMins ?? 15) / 60

      schedule.push({
        title:        ch.name,
        chapterId:    ch.id,
        date:         dateStr,
        startTime:    startH,
        endTime:      endH,
        durationMins: sessionMins,
        color:        COLORS[chapterIdx % COLORS.length],
      })
    }
  }

  return NextResponse.json({ schedule, totalPlanned: schedule.length, totalPending: pending.length })
}
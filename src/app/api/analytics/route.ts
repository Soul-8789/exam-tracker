import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { chapters, userProgress, mockSessions } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import type { Analytics } from "@/lib/types"

// GET /api/analytics — computed stats for the dashboard
export async function GET() {
  const { userId } = await auth()
  if (!userId)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  // Run all queries in parallel
  const [allChapters, progressRows, mockRows] = await Promise.all([
    db.select().from(chapters),
    db.select().from(userProgress).where(eq(userProgress.userId, userId)),
    db.select().from(mockSessions)
      .where(eq(mockSessions.userId, userId))
      .orderBy(desc(mockSessions.attemptedOn))
      .limit(20),
  ])

  const progressMap = new Map(progressRows.map(p => [p.chapterId, p]))

  // Status counts
  let done = 0, inProgress = 0, revision = 0, todo = 0
  let scoreSum = 0, scoreCount = 0
  let totalStudyHours = 0
  const byPriority: Record<string, { total: number; done: number }> = {}
  const weakChapters: Analytics["weakChapters"] = []

  for (const ch of allChapters) {
    const p = progressMap.get(ch.id)
    const status = p?.status ?? "todo"

    if (status === "done")        done++
    else if (status === "in_progress") inProgress++
    else if (status === "revision")    revision++
    else                             todo++

    if (p?.scorePct) {
      const score = parseFloat(p.scorePct)
      scoreSum += score
      scoreCount++
      if (score < 60) weakChapters.push({ id: ch.id, name: ch.name, scorePct: score })
    }

    if (p?.studyHours) totalStudyHours += parseFloat(p.studyHours)

    // By priority breakdown
    if (!byPriority[ch.priority]) byPriority[ch.priority] = { total: 0, done: 0 }
    byPriority[ch.priority].total++
    if (status === "done" || status === "revision") byPriority[ch.priority].done++
  }

  const result: Analytics = {
    totalChapters:   allChapters.length,
    done,
    inProgress,
    revision,
    todo,
    completionPct:   Math.round((done + revision) / allChapters.length * 100),
    avgScore:        scoreCount ? Math.round(scoreSum / scoreCount) : null,
    totalStudyHours: Math.round(totalStudyHours * 10) / 10,
    weakChapters:    weakChapters.sort((a, b) => a.scorePct - b.scorePct).slice(0, 5),
    byPriority,
    mockHistory:     mockRows
      .filter(m => m.totalScore)
      .map(m => ({
        date:  m.attemptedOn,
        score: parseFloat(m.totalScore!),
      })),
  }

  return NextResponse.json(result)
}
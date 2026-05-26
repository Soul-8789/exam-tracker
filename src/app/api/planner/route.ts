import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { studySessions, plannerGoals } from "@/db/schema"
import { eq, and, gte, lte } from "drizzle-orm"

// GET /api/planner?weekStart=2026-05-19
// Returns all sessions for the week + user goals
export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const weekStart = req.nextUrl.searchParams.get("weekStart")
  if (!weekStart) return NextResponse.json({ error: "weekStart required" }, { status: 400 })

  const start = new Date(weekStart)
  const end   = new Date(start)
  end.setDate(end.getDate() + 6)

  const [sessions, goals] = await Promise.all([
    db.select().from(studySessions)
      .where(and(
        eq(studySessions.userId, userId),
        gte(studySessions.date, start.toISOString().slice(0, 10)),
        lte(studySessions.date, end.toISOString().slice(0, 10)),
      )),
    db.select().from(plannerGoals)
      .where(eq(plannerGoals.userId, userId))
      .limit(1),
  ])

  return NextResponse.json({ sessions, goals: goals[0] ?? null })
}

// POST /api/planner — create a session OR save goals
// Body: { type: "session" | "goals", ...fields }
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const body = await req.json()

  if (body.type === "goals") {
    const existing = await db.select().from(plannerGoals)
      .where(eq(plannerGoals.userId, userId)).limit(1)

    const values = {
      userId,
      dailyHoursTarget:     body.dailyHoursTarget     ?? 3,
      weeklyChaptersTarget: body.weeklyChaptersTarget  ?? 5,
      studyDays:            body.studyDays             ?? [1,2,3,4,5,6],
      preferredStartTime:   body.preferredStartTime    ?? "06:00",
      sessionLengthMins:    body.sessionLengthMins     ?? 60,
      breakLengthMins:      body.breakLengthMins       ?? 15,
      examId:               body.examId               ?? null,
      updatedAt:            new Date(),
    }

    if (existing.length) {
      const [updated] = await db.update(plannerGoals)
        .set(values).where(eq(plannerGoals.userId, userId)).returning()
      return NextResponse.json(updated)
    }
    const [created] = await db.insert(plannerGoals).values(values).returning()
    return NextResponse.json(created, { status: 201 })
  }

  if (body.type === "session") {
    if (!body.title || !body.date)
      return NextResponse.json({ error: "title and date required" }, { status: 400 })

    const [session] = await db.insert(studySessions).values({
      userId,
      title:        body.title,
      chapterId:    body.chapterId   ?? null,
      date:         body.date,
      startTime:    body.startTime   ?? null,
      endTime:      body.endTime     ?? null,
      durationMins: body.durationMins ?? 60,
      color:        body.color       ?? "blue",
      notes:        body.notes       ?? null,
    }).returning()
    return NextResponse.json(session, { status: 201 })
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 })
}

// PATCH /api/planner — toggle session complete / update session
// Body: { id, isCompleted? } or { id, ...any session fields }
export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const { id, ...fields } = await req.json()
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  const [updated] = await db.update(studySessions)
    .set(fields)
    .where(and(eq(studySessions.id, id), eq(studySessions.userId, userId)))
    .returning()

  return NextResponse.json(updated)
}

// DELETE /api/planner?id=xxx
export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  await db.delete(studySessions)
    .where(and(eq(studySessions.id, id), eq(studySessions.userId, userId)))

  return NextResponse.json({ success: true })
}
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { mockSessions } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import type { MockUpsert } from "@/lib/types"

// GET /api/mocks — all mock attempts for current user, newest first
export async function GET() {
  const { userId } = await auth()
  if (!userId)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const rows = await db
    .select()
    .from(mockSessions)
    .where(eq(mockSessions.userId, userId))
    .orderBy(desc(mockSessions.attemptedOn))

  return NextResponse.json(rows)
}

// POST /api/mocks — log a new mock attempt
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const body: MockUpsert = await req.json()

  if (!body.examId || !body.attemptedOn)
    return NextResponse.json(
      { error: "examId and attemptedOn are required" },
      { status: 400 }
    )

  const [row] = await db
    .insert(mockSessions)
    .values({
      userId,
      examId:        body.examId,
      attemptedOn:   body.attemptedOn,
      totalScore:    body.totalScore   !== undefined ? String(body.totalScore)   : null,
      sectionScores: body.sectionScores ?? null,
      timeTakenMins: body.timeTakenMins ?? null,
      notes:         body.notes         ?? null,
    })
    .returning()

  return NextResponse.json(row, { status: 201 })
}
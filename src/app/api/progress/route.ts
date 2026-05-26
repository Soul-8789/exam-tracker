import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { userProgress } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import type { ProgressUpsert } from "@/lib/types"

// GET /api/progress — all progress rows for the current user
export async function GET() {
  const { userId } = await auth()
  if (!userId)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const rows = await db
    .select()
    .from(userProgress)
    .where(eq(userProgress.userId, userId))

  return NextResponse.json(rows)
}

// PATCH /api/progress — upsert one chapter's progress
// Body: { chapterId, status?, scorePct?, notes?, studyHours? }
export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const body: ProgressUpsert = await req.json()

  if (!body.chapterId)
    return NextResponse.json({ error: "chapterId is required" }, { status: 400 })

  // Validate scorePct range
  if (body.scorePct !== undefined && (body.scorePct < 0 || body.scorePct > 100))
    return NextResponse.json({ error: "scorePct must be 0–100" }, { status: 400 })

  const now = new Date()

  // Build update values — only include defined fields
  const values: Record<string, unknown> = {
    userId,
    chapterId:    body.chapterId,
    updatedAt:    now,
    lastStudiedAt: now,
  }
  if (body.status     !== undefined) values.status     = body.status
  if (body.scorePct   !== undefined) values.scorePct   = String(body.scorePct)
  if (body.notes      !== undefined) values.notes      = body.notes
  if (body.studyHours !== undefined) values.studyHours = String(body.studyHours)

  // Upsert — insert or update if (userId, chapterId) already exists
  const [row] = await db
    .insert(userProgress)
    .values(values as typeof userProgress.$inferInsert)
    .onConflictDoUpdate({
      target: [userProgress.userId, userProgress.chapterId],
      set: {
        ...values,
        updatedAt: now,
      } as Partial<typeof userProgress.$inferInsert>,
    })
    .returning()

  return NextResponse.json(row)
}
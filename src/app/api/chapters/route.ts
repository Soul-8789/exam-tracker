import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { chapters, userProgress } from "@/db/schema"
import { eq, and } from "drizzle-orm"

// GET /api/chapters?subjectId=xxx
// Returns chapters joined with the current user's progress row (if any)
export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const subjectId = req.nextUrl.searchParams.get("subjectId")
  if (!subjectId)
    return NextResponse.json({ error: "subjectId is required" }, { status: 400 })

  // Fetch chapters for this subject
  const chapterRows = await db
    .select()
    .from(chapters)
    .where(eq(chapters.subjectId, subjectId))
    .orderBy(chapters.sortOrder)

  // Fetch this user's progress for all those chapters in one query
  const progressRows = await db
    .select()
    .from(userProgress)
    .where(eq(userProgress.userId, userId))

  // Merge: attach progress to each chapter
  const progressMap = new Map(progressRows.map(p => [p.chapterId, p]))

  const merged = chapterRows.map(ch => ({
    ...ch,
    progress: progressMap.get(ch.id) ?? null,
  }))

  return NextResponse.json(merged)
}
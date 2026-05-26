import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { exams, subjects, chapters } from "@/db/schema"
import { eq } from "drizzle-orm"

// GET /api/custom
// Returns all exams with subjects + chapters for the sidebar tree
export async function GET() {
  const { userId } = await auth()
  if (!userId)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const rows = await db.query.exams.findMany({
    where: eq(exams.isActive, true),
    with: {
      subjects: {
        orderBy: (s, { asc }) => [asc(s.sortOrder)],
        with: {
          chapters: {
            orderBy: (c, { asc }) => [asc(c.sortOrder)],
          },
        },
      },
    },
  })

  return NextResponse.json(rows)
}

// POST /api/custom — create a new exam
// Body: { name, examDate?, type: "exam" }
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const body = await req.json()
  const { type, name, examDate, subjectData, examId } = body

  if (!name?.trim())
    return NextResponse.json({ error: "name is required" }, { status: 400 })

  // ── Create exam ──────────────────────────────────
  if (type === "exam") {
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      + "-" + Date.now()

    const [exam] = await db
      .insert(exams)
      .values({ name: name.trim(), slug, examDate: examDate || null, isActive: true })
      .returning()
    return NextResponse.json(exam, { status: 201 })
  }

  // ── Create subject under an exam ─────────────────
  if (type === "subject") {
    if (!examId)
      return NextResponse.json({ error: "examId is required" }, { status: 400 })

    // Auto sort_order = count of existing subjects + 1
    const existing = await db
      .select().from(subjects).where(eq(subjects.examId, examId))
    const [subject] = await db
      .insert(subjects)
      .values({
        examId,
        name:            name.trim(),
        totalMarks:      subjectData?.totalMarks      ?? 100,
        sectionTimeMins: subjectData?.sectionTimeMins ?? null,
        sortOrder:       existing.length + 1,
      })
      .returning()
    return NextResponse.json(subject, { status: 201 })
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 })
}
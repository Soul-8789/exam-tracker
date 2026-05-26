import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { chapters } from "@/db/schema"
import { eq } from "drizzle-orm"

// POST /api/custom/chapters
// Body: { subjectId, name, pageRange?, priority?, expectedQs?, section? }
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const body = await req.json()
  const { subjectId, name, pageRange, priority, expectedQs, section } = body

  if (!subjectId || !name?.trim())
    return NextResponse.json(
      { error: "subjectId and name are required" }, { status: 400 }
    )

  // Auto sort_order
  const existing = await db
    .select().from(chapters).where(eq(chapters.subjectId, subjectId))

  const [chapter] = await db
    .insert(chapters)
    .values({
      subjectId,
      name:       name.trim(),
      pageRange:  pageRange  || null,
      priority:   priority   || "medium",
      expectedQs: expectedQs ?? 1,
      section:    section    || null,
      sortOrder:  existing.length + 1,
    })
    .returning()

  return NextResponse.json(chapter, { status: 201 })
}

// PATCH /api/custom/chapters
// Body: { id, name?, pageRange?, priority?, expectedQs? }
export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const { id, ...fields } = await req.json()
  if (!id)
    return NextResponse.json({ error: "id is required" }, { status: 400 })

  const updateData: Record<string, unknown> = {}
  if (fields.name)       updateData.name       = fields.name.trim()
  if (fields.pageRange !== undefined) updateData.pageRange = fields.pageRange
  if (fields.priority)   updateData.priority   = fields.priority
  if (fields.expectedQs !== undefined) updateData.expectedQs = fields.expectedQs
  if (fields.section !== undefined)   updateData.section = fields.section

  const [updated] = await db
    .update(chapters)
    .set(updateData)
    .where(eq(chapters.id, id))
    .returning()

  return NextResponse.json(updated)
}
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { notes } from "@/db/schema"
import { eq, and } from "drizzle-orm"

type Ctx = { params: Promise<{ id: string }> }

// PATCH /api/notes/[id] — update title, content, tag, isPinned, color
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const { id }  = await params
  const body    = await req.json()
  const update: Record<string, unknown> = { updatedAt: new Date() }

  if (body.title   !== undefined) update.title    = body.title.trim()
  if (body.content !== undefined) update.content  = body.content
  if (body.tag     !== undefined) update.tag      = body.tag
  if (body.isPinned!== undefined) update.isPinned = body.isPinned
  if (body.color   !== undefined) update.color    = body.color

  const [updated] = await db.update(notes)
    .set(update)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning()

  return NextResponse.json(updated)
}

// DELETE /api/notes/[id]
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const { id } = await params
  await db.delete(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))

  return NextResponse.json({ success: true })
}
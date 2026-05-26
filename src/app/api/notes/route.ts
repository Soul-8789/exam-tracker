import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { notes } from "@/db/schema"
import { eq, and, ilike, or } from "drizzle-orm"

// GET /api/notes?chapterId=xxx&tag=formula&search=text
export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const sp         = req.nextUrl.searchParams
  const chapterId  = sp.get("chapterId")
  const tag        = sp.get("tag")
  const search     = sp.get("search")

  const conditions = [eq(notes.userId, userId)]
  if (chapterId) conditions.push(eq(notes.chapterId, chapterId))
  if (tag)       conditions.push(eq(notes.tag, tag))
  if (search)    conditions.push(
    or(ilike(notes.title, `%${search}%`), ilike(notes.content, `%${search}%`))!
  )

  const rows = await db.select().from(notes)
    .where(and(...conditions))
    .orderBy(notes.isPinned, notes.updatedAt)

  return NextResponse.json(rows)
}

// POST /api/notes
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const body = await req.json()
  if (!body.title?.trim())
    return NextResponse.json({ error: "title required" }, { status: 400 })

  const [note] = await db.insert(notes).values({
    userId,
    title:     body.title.trim(),
    content:   body.content   ?? null,
    chapterId: body.chapterId ?? null,
    tag:       body.tag       ?? "general",
    isPinned:  body.isPinned  ?? false,
    color:     body.color     ?? "yellow",
  }).returning()

  return NextResponse.json(note, { status: 201 })
}
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { resources } from "@/db/schema"
import { eq, and, ilike, or } from "drizzle-orm"

// GET /api/resources?chapterId=xxx&type=youtube&search=text
export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const sp        = req.nextUrl.searchParams
  const chapterId = sp.get("chapterId")
  const type      = sp.get("type")
  const search    = sp.get("search")

  const conditions = [eq(resources.userId, userId)]
  if (chapterId) conditions.push(eq(resources.chapterId, chapterId))
  if (type)      conditions.push(eq(resources.type, type))
  if (search)    conditions.push(
    or(ilike(resources.title, `%${search}%`),
       ilike(resources.description, `%${search}%`))!
  )

  const rows = await db.select().from(resources)
    .where(and(...conditions))
    .orderBy(resources.createdAt)

  return NextResponse.json(rows)
}

// POST /api/resources
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const body = await req.json()
  if (!body.title?.trim() || !body.url?.trim())
    return NextResponse.json({ error: "title and url required" }, { status: 400 })

  // Auto-detect type from URL
  const detectType = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube"
    if (url.endsWith(".pdf")) return "pdf"
    return body.type ?? "link"
  }

  const [resource] = await db.insert(resources).values({
    userId,
    title:       body.title.trim(),
    url:         body.url.trim(),
    type:        detectType(body.url),
    chapterId:   body.chapterId   ?? null,
    description: body.description ?? null,
  }).returning()

  return NextResponse.json(resource, { status: 201 })
}

// DELETE /api/resources?id=xxx
export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  await db.delete(resources)
    .where(and(eq(resources.id, id), eq(resources.userId, userId)))

  return NextResponse.json({ success: true })
}
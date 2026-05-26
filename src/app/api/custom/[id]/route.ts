import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { exams, subjects, chapters } from "@/db/schema"
import { eq } from "drizzle-orm"

// DELETE /api/custom/[id]?type=exam|subject|chapter
// Cascades are handled by the DB foreign key onDelete:"cascade"
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const { id } = await params
  const type    = req.nextUrl.searchParams.get("type")

  if (type === "exam") {
    await db.delete(exams).where(eq(exams.id, id))
  } else if (type === "subject") {
    await db.delete(subjects).where(eq(subjects.id, id))
  } else if (type === "chapter") {
    await db.delete(chapters).where(eq(chapters.id, id))
  } else {
    return NextResponse.json({ error: "type param required" }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { mockSessions } from "@/db/schema"
import { eq, and } from "drizzle-orm"

// DELETE /api/mocks/[id] — delete one mock session (only if owned by user)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const { id } = await params

  const deleted = await db
    .delete(mockSessions)
    .where(
      and(
        eq(mockSessions.id, id),
        eq(mockSessions.userId, userId)  // never delete another user's data
      )
    )
    .returning()

  if (!deleted.length)
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({ success: true })
}
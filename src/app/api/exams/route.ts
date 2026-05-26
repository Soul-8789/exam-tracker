import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { exams, subjects } from "@/db/schema"
import { eq } from "drizzle-orm"

// GET /api/exams — list all active exams with their subjects
export async function GET() {
  const { userId } = await auth()
  if (!userId)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const rows = await db.query.exams.findMany({
    where: eq(exams.isActive, true),
    with: {
      subjects: {
        orderBy: (s, { asc }) => [asc(s.sortOrder)],
      },
    },
    orderBy: (e, { desc }) => [desc(e.createdAt)],
  })

  return NextResponse.json(rows)
}
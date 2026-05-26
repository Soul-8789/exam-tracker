import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { db } from "@/lib/db"
import { exams } from "@/db/schema"
import { eq } from "drizzle-orm"

export default async function DashboardPage() {
  // Clerk v6 — auth() is now async, must be awaited
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const activeExams = await db
    .select()
    .from(exams)
    .where(eq(exams.isActive, true))

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select an exam to start tracking your preparation
        </p>
      </div>

      {activeExams.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No exams found. Run <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
            npm run db:seed</code> to load SSC CGL data.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeExams.map((exam) => (
            <Link
              key={exam.id}
              href={`/tracker/${exam.id}`}
              className="group block rounded-xl border border-border/60 bg-card p-5
                         hover:border-primary/40 hover:shadow-sm transition-all duration-150">
              <div className="flex items-start justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm">
                  📚
                </div>
                <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full 
              ${exam.isActive 
                ? "bg-green-100 text-green-700" 
                : "bg-gray-200 text-gray-600"}`}
>
                  {exam.isActive ? "Active" : "Archived"}
                </span>
              </div>
              <p className="font-medium text-sm leading-snug group-hover:text-primary transition-colors">
                {exam.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">
                {exam.examDate
                  ? new Date(exam.examDate).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric"
                    })
                  : "Date TBA"
                }
              </p>
              <p className="text-xs text-muted-foreground/40 mt-4 group-hover:text-muted-foreground
                             transition-colors">
                Open tracker →
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
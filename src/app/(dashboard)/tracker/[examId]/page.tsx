"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useExams } from "@/hooks/use-progress"
import { ChapterList } from "@/components/tracker/chapter-list"
import { useTrackerStore } from "@/store/tracker-store"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export default function TrackerPage() {
  const { examId }   = useParams<{ examId: string }>()
  const { data: exams, isLoading } = useExams()
  const { activeSubjectId, setActiveSubjectId } = useTrackerStore()

  // Find the current exam and auto-select its first subject
  const exam = exams?.find((e: any) => e.id === examId)

  useEffect(() => {
    if (exam?.subjects?.length && !activeSubjectId)
      setActiveSubjectId(exam.subjects[0].id)
  }, [exam])

  if (isLoading) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  )

  if (!exam) return (
    <div className="p-6 text-sm text-muted-foreground">Exam not found.</div>
  )

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="px-6 pt-6 pb-0">
        <h1 className="text-xl font-semibold tracking-tight">{exam.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your chapter-wise progress across subjects
        </p>
      </div>

      {/* Subject tabs */}
      <div className="flex gap-1 px-6 mt-4 border-b border-border/60 overflow-x-auto">
        {exam.subjects.map((s: any) => (
          <button
            key={s.id}
            onClick={() => setActiveSubjectId(s.id)}
            className={cn(
              "flex-shrink-0 px-4 pb-2.5 pt-1 text-sm font-medium border-b-2",
              "transition-colors duration-150 -mb-px",
              activeSubjectId === s.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
            {s.name}
          </button>
        ))}
      </div>

      {/* Chapter list */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {activeSubjectId
          ? <ChapterList subjectId={activeSubjectId} />
          : <p className="text-sm text-muted-foreground">Select a subject above.</p>
        }
      </div>
    </div>
  )
}
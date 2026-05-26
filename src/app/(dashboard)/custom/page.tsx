"use client"

import { useState } from "react"
import { useCustomExams, useDeleteCustom } from "@/hooks/use-custom"
import { ExamForm } from "@/components/custom/exam-form"
import { SubjectForm } from "@/components/custom/subject-form"
import { ChapterForm } from "@/components/custom/chapter-form"
import { ChapterList } from "@/components/tracker/chapter-list"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CsvImportDialog } from "@/components/custom/csv-import-dialog"
import {  FileText } from "lucide-react"

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { Plus, Pencil, Trash2, ChevronRight, BookOpen, Layers } from "lucide-react"
import type { Chapter } from "@/lib/types"

type DeleteTarget = { id: string; type: "exam" | "subject" | "chapter"; name: string } | null

export default function CustomTrackerPage() {
  const { data: tree, isLoading } = useCustomExams()
  const { mutate: doDelete } = useDeleteCustom()

  const [activeExamId,    setActiveExamId]    = useState<string | null>(null)
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null)
  const [subjectSheet,   setSubjectSheet]     = useState(false)
  const [chapterSheet,   setChapterSheet]     = useState(false)
  const [editChapter,    setEditChapter]      = useState<Chapter | null>(null)
  const [deleteTarget,   setDeleteTarget]     = useState<DeleteTarget>(null)
  const [importOpen, setImportOpen] = useState(false)

  const activeExam    = tree?.find((e: any) => e.id === activeExamId)
  const activeSubject = activeExam?.subjects?.find((s: any) => s.id === activeSubjectId)

  const handleDelete = () => {
    if (!deleteTarget) return
    doDelete({ id: deleteTarget.id, type: deleteTarget.type }, {
      onSuccess: () => {
        if (deleteTarget.type === "exam" && activeExamId === deleteTarget.id) {
          setActiveExamId(null); setActiveSubjectId(null)
        }
        if (deleteTarget.type === "subject" && activeSubjectId === deleteTarget.id)
          setActiveSubjectId(null)
        setDeleteTarget(null)
      },
    })
  }

  if (isLoading) return (
    <div className="p-6 space-y-3">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── LEFT PANEL: Exam + subject tree ────────────── */}
      <div className="w-64 flex-shrink-0 border-r border-border/60 flex flex-col bg-muted/10">
        <div className="px-3 py-4 border-b border-border/40">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            My trackers
          </p>
          <ExamForm onCreated={(id) => { setActiveExamId(id); setActiveSubjectId(null) }} />
          {/* Import from CSV */}
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 w-full h-9 px-3
                      rounded-md text-sm font-medium border border-dashed border-border
                      text-muted-foreground hover:text-foreground hover:border-primary/50
                      hover:bg-muted/30 transition-all cursor-pointer">
            <FileText className="h-4 w-4" /> Import CSV
          </button>

        </div>
        <CsvImportDialog
  open={importOpen}
  onClose={() => setImportOpen(false)}
/>
        <div className="flex-1 overflow-y-auto py-2">
          {!tree?.length && (
            <p className="text-xs text-muted-foreground text-center py-8 px-3">
              No trackers yet. Create one above.
            </p>
          )}

          {tree?.map((exam: any) => (
            <div key={exam.id} className="mb-1">

              {/* Exam row */}
              <div className={cn(
                "group flex items-center gap-1.5 px-3 py-2 cursor-pointer rounded-md mx-1",
                "hover:bg-accent transition-colors",
                activeExamId === exam.id && "bg-accent"
              )} onClick={() => {
                setActiveExamId(exam.id)
                setActiveSubjectId(exam.subjects?.[0]?.id ?? null)
              }}>
                <ChevronRight className={cn(
                  "h-3 w-3 text-muted-foreground/50 transition-transform flex-shrink-0",
                  activeExamId === exam.id && "rotate-90"
                )} />
                <BookOpen className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium flex-1 truncate">{exam.name}</span>
                <button
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground
                             hover:text-destructive p-0.5 rounded transition-all"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteTarget({ id: exam.id, type: "exam", name: exam.name })
                  }}>
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>

              {/* Subject rows (visible when exam selected) */}
              {activeExamId === exam.id && (
                <div className="ml-5 border-l border-border/40 pl-2 space-y-0.5 mt-0.5">
                  {exam.subjects.map((s: any) => (
                    <div key={s.id} className={cn(
                      "group flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer",
                      "hover:bg-accent transition-colors text-sm",
                      activeSubjectId === s.id && "bg-accent font-medium"
                    )} onClick={() => setActiveSubjectId(s.id)}>
                      <Layers className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="flex-1 truncate">{s.name}</span>
                      <span className="text-[10px] text-muted-foreground/40 tabular-nums">
                        {s.chapters?.length ?? 0}
                      </span>
                      <button
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground
                                   hover:text-destructive p-0.5 rounded transition-all"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteTarget({ id: s.id, type: "subject", name: s.name })
                        }}>
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {/* Add subject button */}
                  <button
                    className="flex items-center gap-1 px-2 py-1.5 text-xs text-muted-foreground
                               hover:text-foreground transition-colors w-full rounded-md hover:bg-accent"
                    onClick={() => setSubjectSheet(true)}>
                    <Plus className="h-3 w-3" /> Add subject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL: Chapter list + actions ─────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {!activeExamId ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
            <span className="text-4xl">📚</span>
            <p className="text-base font-medium">Select or create a tracker</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Create a custom tracker for any exam, course, or subject.
              Add your own subjects and chapters and track progress the same way.
            </p>
          </div>
        ) : !activeSubjectId ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
            <span className="text-3xl">🗂️</span>
            <p className="text-sm font-medium">No subjects yet</p>
            <Button size="sm" onClick={() => setSubjectSheet(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Add first subject
            </Button>
          </div>
        ) : (
          <>
            {/* Chapter list header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
              <div>
                <h2 className="font-semibold text-base">{activeExam?.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeSubject?.name}  · 
                  {activeSubject?.chapters?.length ?? 0} chapters
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline"
                  onClick={() => setDeleteTarget({
                    id: activeSubjectId, type: "subject",
                    name: activeSubject?.name ?? ""
                  })}>
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete subject
                </Button>
                <Button size="sm"
                  onClick={() => { setEditChapter(null); setChapterSheet(true) }}>
                  <Plus className="h-4 w-4 mr-1.5" /> Add chapter
                </Button>
              </div>
            </div>

            {/* Reuse Phase 3 ChapterList — it already handles status + score */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <ChapterList subjectId={activeSubjectId} />
            </div>
          </>
        )}
      </div>

      {/* ── Sheets + Dialogs ─────────────────────────────── */}
      {activeExamId && (
        <SubjectForm
          examId={activeExamId}
          open={subjectSheet}
          onClose={() => setSubjectSheet(false)}
        />
      )}

      {activeSubjectId && (
        <ChapterForm
          subjectId={activeSubjectId}
          open={chapterSheet}
          onClose={() => { setChapterSheet(false); setEditChapter(null) }}
          editChapter={editChapter}
        />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteTarget?.type} "{deleteTarget?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === "exam"
                ? "This will permanently delete the tracker along with all its subjects, chapters, and your progress data."
                : deleteTarget?.type === "subject"
                ? "This will delete the subject and all its chapters. Your progress for these chapters will also be removed."
                : "This will permanently delete the chapter and its progress data."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
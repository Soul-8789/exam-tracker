"use client"

import { useState, useMemo } from "react"
import { useNotes, useResources } from "@/hooks/use-notes"
import { useExams } from "@/hooks/use-progress"
import { NoteEditor }         from "@/components/notes/note-editor"
import { NoteCard }           from "@/components/notes/note-card"
import { ResourceCard }       from "@/components/notes/resource-card"
import { AddResourceDialog }  from "@/components/notes/add-resource-dialog"
import { NotesToolbar }       from "@/components/notes/notes-toolbar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Plus, BookOpen, ChevronRight } from "lucide-react"

export default function NotesPage() {
  const [activeTab,     setActiveTab]     = useState<"notes" | "resources">("notes")
  const [search,        setSearch]        = useState("")
  const [noteTag,       setNoteTag]       = useState("")
  const [resType,       setResType]       = useState("")
  const [activeChapter, setActiveChapter] = useState<string | null>(null)
  const [addingNote,    setAddingNote]    = useState(false)
  const [addingRes,     setAddingRes]     = useState(false)
  const [activeExamIdx, setActiveExamIdx] = useState(0)

  const { data: exams, isLoading: examsLoading } = useExams()

  const notesFilter = useMemo(() => ({
    ...(activeChapter ? { chapterId: activeChapter } : {}),
    ...(noteTag       ? { tag: noteTag }             : {}),
    ...(search        ? { search }                   : {}),
  }), [activeChapter, noteTag, search])

  const resFilter = useMemo(() => ({
    ...(activeChapter ? { chapterId: activeChapter } : {}),
    ...(resType       ? { type: resType }            : {}),
    ...(search        ? { search }                   : {}),
  }), [activeChapter, resType, search])

  const { data: notesData,    isLoading: notesLoading }    = useNotes(notesFilter)
  const { data: resourcesData,isLoading: resourcesLoading } = useResources(resFilter)

  const activeExam = exams?.[activeExamIdx]
  const allChapters = activeExam?.subjects?.flatMap((s: any) => s.chapters ?? []) ?? []

  const pinnedNotes = (notesData ?? []).filter((n: any) => n.isPinned)
  const otherNotes  = (notesData ?? []).filter((n: any) => !n.isPinned)

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── LEFT: Chapter sidebar ──────────────────────── */}
      <div className="w-60 flex-shrink-0 border-r border-border/60 flex flex-col bg-muted/10">

        {/* Exam switcher */}
        <div className="px-3 py-3 border-b border-border/40">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Exam
          </p>
          <div className="flex gap-1 flex-wrap">
            {exams?.map((e: any, i: number) => (
              <button key={e.id} type="button" onClick={() => { setActiveExamIdx(i); setActiveChapter(null) }}
                className={cn(
                  "text-[11px] px-2 py-1 rounded-md border transition-all truncate max-w-full",
                  activeExamIdx === i
                    ? "bg-primary/10 text-primary border-primary/30 font-medium"
                    : "border-border text-muted-foreground hover:border-foreground/20"
                )}>
                {e.name}
              </button>
            ))}
          </div>
        </div>

        {/* All notes option */}
        <button type="button"
          onClick={() => setActiveChapter(null)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm transition-colors",
            "hover:bg-accent border-b border-border/40",
            !activeChapter && "bg-accent font-medium"
          )}>
          <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          All notes
        </button>

        {/* Chapter list */}
        <div className="flex-1 overflow-y-auto py-1">
          {allChapters.map((ch: any) => (
            <button key={ch.id} type="button"
              onClick={() => setActiveChapter(ch.id)}
              className={cn(
                "w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors text-left",
                "hover:bg-accent",
                activeChapter === ch.id && "bg-accent font-medium"
              )}>
              <ChevronRight className={cn(
                "h-3 w-3 text-muted-foreground/50 flex-shrink-0 transition-transform",
                activeChapter === ch.id && "rotate-90 text-primary"
              )} />
              <span className="truncate text-xs">{ch.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Notes + Resources ────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 flex-shrink-0">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Notes & Resources</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {activeChapter
                ? allChapters.find((c: any) => c.id === activeChapter)?.name ?? "Chapter"
                : "All chapters"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === "notes" ? (
              <Button size="sm" onClick={() => setAddingNote(true)} className="gap-1.5">
                <Plus className="h-4 w-4" /> Add note
              </Button>
            ) : (
              <Button size="sm" onClick={() => setAddingRes(true)} className="gap-1.5">
                <Plus className="h-4 w-4" /> Add resource
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)}>
            <div className="flex items-center justify-between mb-4">
              <TabsList className="h-9">
                <TabsTrigger value="notes"     className="text-xs">
                  📝 Notes {notesData && <span className="ml-1 text-[10px] opacity-60">{notesData.length}</span>}
                </TabsTrigger>
                <TabsTrigger value="resources" className="text-xs">
                  🔗 Resources {resourcesData && <span className="ml-1 text-[10px] opacity-60">{resourcesData.length}</span>}
                </TabsTrigger>
              </TabsList>
            </div>

            <NotesToolbar
              search={search} onSearch={setSearch}
              noteTag={noteTag} onNoteTag={setNoteTag}
              resType={resType} onResType={setResType}
              activeTab={activeTab}
            />

            <TabsContent value="notes" className="mt-4 space-y-4">
              {addingNote && (
                <NoteEditor
                  chapterId={activeChapter ?? undefined}
                  onClose={() => setAddingNote(false)}
                />
              )}

              {notesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_,i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
                </div>
              ) : (
                <>
                  {pinnedNotes.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider
                                   text-muted-foreground mb-2">
                        📌 Pinned
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pinnedNotes.map((n: any) => (
                          <NoteCard key={n.id} note={n} chapterId={activeChapter ?? undefined} />
                        ))}
                      </div>
                    </div>
                  )}

                  {otherNotes.length > 0 && (
                    <div>
                      {pinnedNotes.length > 0 && (
                        <p className="text-[10px] font-semibold uppercase tracking-wider
                                     text-muted-foreground mb-2">
                          All notes
                        </p>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {otherNotes.map((n: any) => (
                          <NoteCard key={n.id} note={n} chapterId={activeChapter ?? undefined} />
                        ))}
                      </div>
                    </div>
                  )}

                  {!notesData?.length && !addingNote && (
                    <div className="text-center py-16 flex flex-col items-center gap-3">
                      <span className="text-4xl">📝</span>
                      <p className="font-medium text-sm">No notes yet</p>
                      <p className="text-xs text-muted-foreground">
                        Click "Add note" to write your first note for this chapter.
                      </p>
                      <Button size="sm" onClick={() => setAddingNote(true)} className="gap-1.5 mt-1">
                        <Plus className="h-4 w-4" /> Add note
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="resources" className="mt-4">
              {resourcesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(4)].map((_,i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
                </div>
              ) : resourcesData?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resourcesData.map((r: any) => (
                    <ResourceCard key={r.id} resource={r} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 flex flex-col items-center gap-3">
                  <span className="text-4xl">🔗</span>
                  <p className="font-medium text-sm">No resources yet</p>
                  <p className="text-xs text-muted-foreground">
                    Save YouTube videos, articles, PDFs linked to this chapter.
                  </p>
                  <Button size="sm" onClick={() => setAddingRes(true)} className="gap-1.5 mt-1">
                    <Plus className="h-4 w-4" /> Add resource
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AddResourceDialog
        open={addingRes}
        onClose={() => setAddingRes(false)}
        chapterId={activeChapter ?? undefined}
      />

    </div>
  )
}
"use client"

import { useState } from "react"
import { useDeleteNote, useUpdateNote } from "@/hooks/use-notes"
import { NoteEditor } from "./note-editor"
import { cn } from "@/lib/utils"
import { Pin, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react"

const BG_COLOR: Record<string, string> = {
  yellow: "bg-yellow-50  dark:bg-yellow-950/40  border-yellow-200  dark:border-yellow-800",
  blue:   "bg-blue-50    dark:bg-blue-950/40    border-blue-200    dark:border-blue-800",
  green:  "bg-green-50   dark:bg-green-950/40   border-green-200   dark:border-green-800",
  pink:   "bg-pink-50    dark:bg-pink-950/40    border-pink-200    dark:border-pink-800",
  purple: "bg-purple-50  dark:bg-purple-950/40  border-purple-200  dark:border-purple-800",
}

const TAG_COLOR: Record<string, string> = {
  formula:  "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  shortcut: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  mistake:  "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  revision: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
  general:  "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
}

const TAG_LABELS: Record<string, string> = {
  formula:"📐 Formula", shortcut:"⚡ Shortcut", mistake:"❌ Mistake",
  revision:"🔁 Revision", general:"General",
}

export function NoteCard({ note, chapterId }: { note: any; chapterId?: string }) {
  const [editing,   setEditing]   = useState(false)
  const [expanded,  setExpanded]  = useState(false)
  const { mutate: remove }  = useDeleteNote()
  const { mutate: update }  = useUpdateNote()
  const bg = BG_COLOR[note.color] ?? BG_COLOR.yellow
  const preview = (note.content ?? "").slice(0, 120)

  if (editing) return (
    <NoteEditor
      chapterId={chapterId}
      editNote={note}
      onClose={() => setEditing(false)}
    />
  )

  return (
    <div className={cn(
      "group relative rounded-xl border-2 p-4 flex flex-col gap-2 transition-shadow hover:shadow-md",
      bg, note.isPinned && "ring-1 ring-primary/30"
    )}>

      {/* Pin indicator */}
      {note.isPinned && (
        <Pin className="absolute top-3 right-3 h-3.5 w-3.5 text-primary/60" />
      )}

      {/* Title + tag */}
      <div className="flex items-start gap-2 pr-5">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug">{note.title}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {new Date(note.updatedAt).toLocaleDateString("en-IN",
              { day:"numeric", month:"short" })}
          </p>
        </div>
        {note.tag && note.tag !== "general" && (
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0",
            TAG_COLOR[note.tag] ?? TAG_COLOR.general)}>
            {TAG_LABELS[note.tag] ?? note.tag}
          </span>
        )}
      </div>

      {/* Content preview */}
      {preview && (
        <p className={cn(
          "text-xs text-muted-foreground font-mono leading-relaxed whitespace-pre-wrap",
          !expanded && "line-clamp-3"
        )}>
          {expanded ? note.content : preview}
          {(note.content?.length ?? 0) > 120 && "..."}
        </p>
      )}

      {/* Expand / actions */}
      <div className="flex items-center justify-between mt-1">
        {(note.content?.length ?? 0) > 120 ? (
          <button type="button" onClick={() => setExpanded(!expanded)}
            className="text-[10px] text-muted-foreground flex items-center gap-0.5
                       hover:text-foreground transition-colors">
            {expanded ? <><ChevronUp className="h-3 w-3"/> less</>
                      : <><ChevronDown className="h-3 w-3"/> more</>}
          </button>
        ) : <span />}

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button type="button"
            onClick={() => update({ id: note.id, isPinned: !note.isPinned })}
            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10
                       text-muted-foreground hover:text-foreground transition-colors">
            <Pin className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => setEditing(true)}
            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10
                       text-muted-foreground hover:text-foreground transition-colors">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => remove(note.id)}
            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10
                       text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
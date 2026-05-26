"use client"

import { useState, useEffect } from "react"
import { useCreateNote, useUpdateNote } from "@/hooks/use-notes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Pin, PinOff, X, Save } from "lucide-react"

const TAGS = [
  { value: "general",  label: "General",   color: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"      },
  { value: "formula",  label: "📐 Formula", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"      },
  { value: "shortcut", label: "⚡ Shortcut",color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"    },
  { value: "mistake",  label: "❌ Mistake", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"           },
  { value: "revision", label: "🔁 Revision",color: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300" },
]

const NOTE_COLORS = [
  { value: "yellow", cls: "bg-yellow-50  dark:bg-yellow-950/40  border-yellow-200  dark:border-yellow-800" },
  { value: "blue",   cls: "bg-blue-50    dark:bg-blue-950/40    border-blue-200    dark:border-blue-800"   },
  { value: "green",  cls: "bg-green-50   dark:bg-green-950/40   border-green-200   dark:border-green-800"  },
  { value: "pink",   cls: "bg-pink-50    dark:bg-pink-950/40    border-pink-200    dark:border-pink-800"   },
  { value: "purple", cls: "bg-purple-50  dark:bg-purple-950/40  border-purple-200  dark:border-purple-800" },
]

const DOT_COLOR: Record<string, string> = {
  yellow:"bg-yellow-400", blue:"bg-blue-400", green:"bg-green-400",
  pink:"bg-pink-400", purple:"bg-purple-400"
}

interface Props {
  chapterId?: string
  editNote?:  any | null
  onClose:    () => void
}

export function NoteEditor({ chapterId, editNote, onClose }: Props) {
  const isEdit = !!editNote
  const [title,   setTitle]   = useState(editNote?.title   ?? "")
  const [content, setContent] = useState(editNote?.content ?? "")
  const [tag,     setTag]     = useState(editNote?.tag     ?? "general")
  const [color,   setColor]   = useState(editNote?.color   ?? "yellow")
  const [pinned,  setPinned]  = useState(editNote?.isPinned ?? false)
  const [error,   setError]   = useState("")

  const { mutate: create, isPending: creating } = useCreateNote()
  const { mutate: update, isPending: updating } = useUpdateNote()
  const isPending = creating || updating
  const bgCls     = NOTE_COLORS.find(c => c.value === color)?.cls ?? NOTE_COLORS[0].cls

  const submit = () => {
    if (!title.trim()) { setError("Title is required"); return }
    const payload = { title: title.trim(), content, tag, isPinned: pinned, color, chapterId }
    if (isEdit) {
      update({ id: editNote.id, ...payload }, { onSuccess: onClose })
    } else {
      create(payload, { onSuccess: onClose, onError: e => setError(e.message) })
    }
  }

  return (
    <div className={cn("rounded-xl border-2 p-4 flex flex-col gap-3 shadow-sm", bgCls)}>

      {/* Header */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Note title..."
          value={title}
          onChange={e => { setTitle(e.target.value); setError("") }}
          className="flex-1 bg-transparent border-none shadow-none text-sm font-semibold
                     focus-visible:ring-0 px-0 placeholder:text-foreground/40 h-7"
        />
        <button type="button" onClick={() => setPinned(!pinned)}
          className="text-muted-foreground hover:text-foreground transition-colors">
          {pinned ? <Pin className="h-4 w-4 text-primary" /> : <PinOff className="h-4 w-4" />}
        </button>
        <button type="button" onClick={onClose}
          className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* Content textarea */}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Write your note here... supports markdown: **bold**, *italic*, `code`"
        rows={6}
        className="w-full bg-transparent resize-none text-sm border-none outline-none
                   placeholder:text-foreground/30 font-mono leading-relaxed"
      />

      {/* Footer controls */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-black/10 dark:border-white/10">
        <div className="flex items-center gap-2">
          {/* Tag picker */}
          <div className="flex gap-1 flex-wrap">
            {TAGS.map(t => (
              <button key={t.value} type="button"
                onClick={() => setTag(t.value)}
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full border transition-all font-medium",
                  tag === t.value ? t.color + " border-current" : "border-transparent text-muted-foreground hover:border-border"
                )}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Color dots */}
          <div className="flex gap-1">
            {NOTE_COLORS.map(c => (
              <button key={c.value} type="button" onClick={() => setColor(c.value)}
                className={cn(
                  "w-4 h-4 rounded-full border-2 transition-transform",
                  DOT_COLOR[c.value],
                  color === c.value ? "scale-125 border-foreground" : "border-transparent"
                )} />
            ))}
          </div>
          <Button size="sm" onClick={submit} disabled={isPending} className="h-7 gap-1 text-xs">
            <Save className="h-3 w-3" />
            {isPending ? "Saving…" : isEdit ? "Update" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  )
}
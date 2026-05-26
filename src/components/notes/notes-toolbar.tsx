"use client"

import { cn } from "@/lib/utils"
import { Search, X } from "lucide-react"

const NOTE_TAGS = [
  { value: "",         label: "All notes"  },
  { value: "formula",  label: "📐 Formula" },
  { value: "shortcut", label: "⚡ Shortcut"},
  { value: "mistake",  label: "❌ Mistake" },
  { value: "revision", label: "🔁 Revision"},
  { value: "general",  label: "General"    },
]

const RES_TYPES = [
  { value: "",         label: "All resources" },
  { value: "youtube", label: "▶ YouTube"     },
  { value: "article", label: "📄 Article"     },
  { value: "pdf",     label: "📕 PDF"         },
  { value: "book",    label: "📗 Book"        },
  { value: "link",    label: "🔗 Link"        },
]

interface Props {
  search:         string
  onSearch:       (v: string) => void
  noteTag:        string
  onNoteTag:      (v: string) => void
  resType:        string
  onResType:      (v: string) => void
  activeTab:      "notes" | "resources"
}

export function NotesToolbar({ search, onSearch, noteTag, onNoteTag, resType, onResType, activeTab }: Props) {
  const filters = activeTab === "notes" ? NOTE_TAGS : RES_TYPES
  const current = activeTab === "notes" ? noteTag   : resType
  const set     = activeTab === "notes" ? onNoteTag : onResType

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground/50" />
        <input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder={activeTab === "notes" ? "Search notes..." : "Search resources..."}
          className="w-full h-9 pl-9 pr-9 rounded-lg border border-border bg-background
                     text-sm placeholder:text-muted-foreground/40 focus:outline-none
                     focus:ring-1 focus:ring-ring"
        />
        {search && (
          <button type="button" onClick={() => onSearch("")}
            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {filters.map(f => (
          <button key={f.value} type="button" onClick={() => set(f.value)}
            className={cn(
              "text-xs px-3 py-1 rounded-full border transition-all font-medium",
              current === f.value
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
            )}>
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}
"use client"

import { useTrackerStore } from "@/store/tracker-store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Search, X } from "lucide-react"

const STATUS_FILTERS = [
  { value: "all",         label: "All"        },
  { value: "todo",        label: "📋 To-do"    },
  { value: "in_progress", label: "📖 Active"   },
  { value: "revision",    label: "🔁 Revision" },
  { value: "done",        label: "✅ Done"     },
] as const

const PRIORITY_FILTERS = [
  { value: "all",    label: "All priority" },
  { value: "fire",   label: "🔥 Must-do"   },
  { value: "high",   label: "High"         },
  { value: "medium", label: "Medium"       },
  { value: "low",    label: "Low"          },
] as const

export function FilterBar() {
  const {
    search, filterStatus, filterPriority,
    setSearch, setFilterStatus, setFilterPriority,
  } = useTrackerStore()

  return (
    <div className="flex flex-col gap-3 pb-3 border-b border-border/60">
      {/* Search */}
      <div className="relative w-full max-w-xs">
        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground/50" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search chapters..."
          className={cn(
            "h-8 w-full rounded-md border border-border bg-background pl-7 pr-8",
            "text-sm placeholder:text-muted-foreground/40 focus:outline-none",
            "focus:ring-1 focus:ring-ring"
          )}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2 top-2 text-muted-foreground/50 hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={filterStatus === f.value ? "secondary" : "ghost"}
            className={cn(
              "h-7 rounded-full px-3 text-xs",
              filterStatus === f.value && "font-medium"
            )}
            onClick={() => setFilterStatus(f.value)}>
            {f.label}
          </Button>
        ))}
        <div className="w-px bg-border mx-1 self-stretch" />
        {PRIORITY_FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={filterPriority === f.value ? "secondary" : "ghost"}
            className={cn(
              "h-7 rounded-full px-3 text-xs",
              filterPriority === f.value && "font-medium"
            )}
            onClick={() => setFilterPriority(f.value)}>
            {f.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
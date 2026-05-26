"use client"

import { useDeleteResource } from "@/hooks/use-notes"
import { cn } from "@/lib/utils"
import { ExternalLink, Trash2, PlayCircle, FileText, BookOpen, Link2 } from "lucide-react"

const TYPE_META: Record<string, { icon: any; label: string; color: string }> = {
  youtube: { icon: PlayCircle,   label: "YouTube", color: "text-red-500 bg-red-50 dark:bg-red-950/40"         },
  article: { icon: FileText,  label: "Article", color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40"       },
  pdf:     { icon: FileText,  label: "PDF",     color: "text-orange-500 bg-orange-50 dark:bg-orange-950/40"  },
  book:    { icon: BookOpen,  label: "Book",    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"},
  link:    { icon: Link2,     label: "Link",    color: "text-zinc-500 bg-zinc-50 dark:bg-zinc-900"            },
}

function getYTThumb(url: string) {
  const m = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)
  return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null
}

export function ResourceCard({ resource }: { resource: any }) {
  const { mutate: remove } = useDeleteResource()
  const meta   = TYPE_META[resource.type] ?? TYPE_META.link
  const Icon   = meta.icon
  const thumb  = resource.type === "youtube" ? getYTThumb(resource.url) : null

  return (
    <div className="group relative flex flex-col rounded-xl border border-border/60
                    bg-card hover:border-border hover:shadow-sm transition-all overflow-hidden">

      {/* YouTube thumbnail */}
      {thumb && (
        <div className="relative w-full aspect-video overflow-hidden bg-muted">
          <img src={thumb} alt={resource.title}
            className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-red-600/90 flex items-center justify-center">
              <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[10px]
                              border-transparent border-l-white ml-1" />
            </div>
          </div>
        </div>
      )}

      <div className="p-3 flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <div className={cn("p-1.5 rounded-md flex-shrink-0", meta.color.split(" ").slice(1).join(" "))}>
            <Icon className={cn("h-3.5 w-3.5", meta.color.split(" ")[0])} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-snug line-clamp-2">{resource.title}</p>
            {resource.description && (
              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                {resource.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", meta.color)}>
            {meta.label}
          </span>
          <div className="flex items-center gap-1">
            <a href={resource.url} target="_blank" rel="noreferrer"
              className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button type="button" onClick={() => remove(resource.id)}
              className="p-1 rounded text-muted-foreground hover:text-destructive
                         transition-colors opacity-0 group-hover:opacity-100">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
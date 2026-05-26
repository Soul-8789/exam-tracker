"use client"

import { useState } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCreateResource } from "@/hooks/use-notes"
import { cn } from "@/lib/utils"

const TYPES = [
  { value: "youtube", label: "▶ YouTube" },
  { value: "article", label: "📄 Article" },
  { value: "pdf",     label: "📕 PDF"     },
  { value: "book",    label: "📗 Book"    },
  { value: "link",    label: "🔗 Link"    },
]

interface Props { open: boolean; onClose: () => void; chapterId?: string }

export function AddResourceDialog({ open, onClose, chapterId }: Props) {
  const [title, setTitle]   = useState("")
  const [url,   setUrl]     = useState("")
  const [type,  setType]    = useState("link")
  const [desc,  setDesc]    = useState("")
  const [error, setError]   = useState("")
  const { mutate, isPending } = useCreateResource()

  // Auto-detect type when user pastes a URL
  const handleUrl = (v: string) => {
    setUrl(v)
    if (v.includes("youtube.com") || v.includes("youtu.be")) setType("youtube")
    else if (v.endsWith(".pdf")) setType("pdf")
  }

  const reset = () => {
    setTitle(""); setUrl(""); setType("link"); setDesc(""); setError("")
  }

  const submit = () => {
    if (!title.trim()) { setError("Title is required"); return }
    if (!url.trim())   { setError("URL is required");   return }
    mutate(
      { title: title.trim(), url: url.trim(), type, description: desc || null, chapterId },
      { onSuccess: () => { reset(); onClose() }, onError: e => setError(e.message) }
    )
  }

  return (
    <Dialog open={open} onOpenChange={o => !o && (reset(), onClose())}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add resource</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>URL <span className="text-destructive">*</span></Label>
            <Input placeholder="https://..." value={url}
              onChange={e => handleUrl(e.target.value)} autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label>Title <span className="text-destructive">*</span></Label>
            <Input placeholder="e.g. Syllogism tricks by XYZ" value={title}
              onChange={e => { setTitle(e.target.value); setError("") }}
              onKeyDown={e => e.key === "Enter" && submit()} />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <div className="flex gap-2 flex-wrap">
              {TYPES.map(t => (
                <button key={t.value} type="button" onClick={() => setType(t.value)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full border transition-all",
                    type === t.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  )}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea placeholder="What's in this resource?" rows={2}
              value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onClose() }}>Cancel</Button>
          <Button onClick={submit} disabled={isPending}>
            {isPending ? "Saving…" : "Add resource"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
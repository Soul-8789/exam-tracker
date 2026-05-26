"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { useCreateChapter, useEditChapter } from "@/hooks/use-custom"
import type { Chapter } from "@/lib/types"

const PRIORITIES = [
  { value: "fire",   label: "🔥 Must-do"  },
  { value: "high",   label: "High"        },
  { value: "medium", label: "Medium"      },
  { value: "low",    label: "Low"         },
]

interface Props {
  subjectId:   string
  open:        boolean
  onClose:     () => void
  editChapter?: Chapter | null  // pass to enter edit mode
}

export function ChapterForm({ subjectId, open, onClose, editChapter }: Props) {
  const isEdit = !!editChapter

  const [name, setName]         = useState("")
  const [pageRange, setPageRange] = useState("")
  const [priority, setPriority]   = useState("medium")
  const [expectedQs, setExpectedQs] = useState("1")
  const [section, setSection]     = useState("")
  const [error, setError]         = useState("")

  const { mutate: create, isPending: creating } = useCreateChapter()
  const { mutate: edit,   isPending: editing   } = useEditChapter()
  const isPending = creating || editing

  // Prefill form when editing
  useEffect(() => {
    if (editChapter) {
      setName(editChapter.name)
      setPageRange(editChapter.pageRange ?? "")
      setPriority(editChapter.priority)
      setExpectedQs(String(editChapter.expectedQs ?? 1))
      setSection(editChapter.section ?? "")
    } else {
      setName(""); setPageRange(""); setPriority("medium")
      setExpectedQs("1"); setSection("")
    }
    setError("")
  }, [editChapter, open])

  const submit = () => {
    if (!name.trim()) { setError("Chapter name is required"); return }
    const payload = {
      name: name.trim(),
      pageRange:  pageRange  || undefined,
      priority,
      expectedQs: parseInt(expectedQs) || 1,
      section:    section    || undefined,
    }
    if (isEdit) {
      edit({ id: editChapter!.id, ...payload },
        { onSuccess: onClose, onError: (e) => setError(e.message) })
    } else {
      create({ subjectId, ...payload },
        { onSuccess: onClose, onError: (e) => setError(e.message) })
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit chapter" : "Add chapter"}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 py-6">

          <div className="space-y-1.5">
            <Label>Chapter name <span className="text-destructive">*</span></Label>
            <Input placeholder="e.g. Coding–Decoding, Syllogism..."
              value={name} onChange={(e) => { setName(e.target.value); setError("") }}
              autoFocus />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Priority</Label>
<Select
  value={priority}
  onValueChange={(val) => setPriority(val ?? "medium")}
>              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Page range <span className="text-muted-foreground font-normal text-xs">opt</span></Label>
              <Input placeholder="e.g. 1–47" value={pageRange}
                onChange={(e) => setPageRange(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Expected Qs</Label>
              <Input type="number" min={0} value={expectedQs}
                onChange={(e) => setExpectedQs(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Section tag <span className="text-muted-foreground font-normal text-xs">opt</span></Label>
            <Input placeholder="e.g. verbal, nonverbal, algebra..."
              value={section} onChange={(e) => setSection(e.target.value)} />
            <p className="text-[10px] text-muted-foreground">
              Used to group chapters in the tracker view
            </p>
          </div>

        </div>
        <SheetFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={isPending}>
            {isPending ? "Saving…" : isEdit ? "Save changes" : "Add chapter"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
"use client"

import { useState } from "react"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateExam } from "@/hooks/use-custom"
import { Plus } from "lucide-react"

export function ExamForm({ onCreated }: { onCreated?: (id: string) => void }) {
  const [open, setOpen]   = useState(false)
  const [name, setName]   = useState("")
  const [date, setDate]   = useState("")
  const [error, setError] = useState("")
  const { mutate, isPending } = useCreateExam()

  const submit = () => {
    if (!name.trim()) { setError("Exam name is required"); return }
    mutate(
      { name: name.trim(), examDate: date || undefined },
      {
        onSuccess: (exam) => {
          setOpen(false); setName(""); setDate("")
          onCreated?.(exam.id)
        },
        onError: (e) => setError(e.message),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>

      {/* ✅ No asChild — DialogTrigger renders its own button,
             then Button renders as a styled child inside it.
             Use div/span wrapper to avoid button-in-button. */}
      <DialogTrigger className="w-full">
        <div className="inline-flex items-center justify-center gap-1.5 w-full
                        h-9 px-3 rounded-md text-sm font-medium
                        bg-primary text-primary-foreground
                        hover:bg-primary/90 transition-colors cursor-pointer">
          <Plus className="h-4 w-4" /> New tracker
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Create new tracker</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="exam-name">
              Tracker name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="exam-name"
              placeholder="e.g. UPSC Prelims 2027, My DSA Practice..."
              value={name}
              onChange={(e) => { setName(e.target.value); setError("") }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              autoFocus
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="exam-date">
              Target date{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="exam-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={isPending}>
            {isPending ? "Creating…" : "Create tracker"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
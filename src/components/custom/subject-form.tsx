"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateSubject } from "@/hooks/use-custom"

interface Props {
  examId:  string
  open:    boolean
  onClose: () => void
}

export function SubjectForm({ examId, open, onClose }: Props) {
  const [name, setName]   = useState("")
  const [marks, setMarks] = useState("100")
  const [mins, setMins]   = useState("")
  const [error, setError] = useState("")
  const { mutate, isPending } = useCreateSubject()

  const reset = () => { setName(""); setMarks("100"); setMins(""); setError("") }

  const submit = () => {
    if (!name.trim()) { setError("Subject name is required"); return }
    mutate({
      examId,
      name: name.trim(),
      subjectData: {
        totalMarks:      parseInt(marks) || 100,
        sectionTimeMins: mins ? parseInt(mins) : undefined,
      },
    }, {
      onSuccess: () => { reset(); onClose() },
      onError:   (e) => setError(e.message),
    })
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>Add subject / section</SheetTitle>
        </SheetHeader>
        <div className="space-y-5 py-6">
          <div className="space-y-1.5">
            <Label>Subject name <span className="text-destructive">*</span></Label>
            <Input
              placeholder="e.g. Reasoning, Mathematics, History..."
              value={name}
              onChange={(e) => { setName(e.target.value); setError("") }}
              autoFocus
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Total marks</Label>
              <Input type="number" min={1} value={marks}
                onChange={(e) => setMarks(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Time (mins) <span className="text-muted-foreground font-normal text-xs">opt</span></Label>
              <Input type="number" min={1} placeholder="e.g. 30"
                value={mins} onChange={(e) => setMins(e.target.value)} />
            </div>
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => { reset(); onClose() }}>Cancel</Button>
          <Button onClick={submit} disabled={isPending}>
            {isPending ? "Adding…" : "Add subject"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
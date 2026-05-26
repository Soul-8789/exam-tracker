"use client"

import { useState } from "react"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAddMock } from "@/hooks/use-mocks"
import { useExams } from "@/hooks/use-progress"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

// SSC CGL Tier-1 sections — max 50 marks each
const SECTIONS = [
  { key: "reasoning", label: "Reasoning",    max: 50 },
  { key: "quant",     label: "Quantitative", max: 50 },
  { key: "english",   label: "English",      max: 50 },
  { key: "ga",        label: "Gen Awareness",max: 50 },
]

type SectionScores = Record<string, string>

interface Props { examId: string }

export function AddMockDialog({ examId }: Props) {
  const [open, setOpen]   = useState(false)
  const [date, setDate]   = useState(new Date().toISOString().slice(0, 10))
  const [time, setTime]   = useState("")
  const [notes, setNotes] = useState("")
  const [scores, setScores] = useState<SectionScores>(
    Object.fromEntries(SECTIONS.map((s) => [s.key, ""]))
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { mutate, isPending } = useAddMock()

  const totalScore = SECTIONS.reduce((sum, s) => {
    const v = parseFloat(scores[s.key])
    return sum + (isNaN(v) ? 0 : v)
  }, 0)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!date) errs.date = "Date is required"
    SECTIONS.forEach((s) => {
      const v = parseFloat(scores[s.key])
      if (scores[s.key] !== "" && (isNaN(v) || v < 0 || v > s.max))
        errs[s.key] = `Must be 0–${s.max}`
    })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    const sectionScores = Object.fromEntries(
      SECTIONS
        .filter((s) => scores[s.key] !== "")
        .map((s) => [s.key, parseFloat(scores[s.key])])
    )

    mutate({
      examId,
      attemptedOn:    date,
      totalScore:     totalScore || undefined,
      sectionScores:  Object.keys(sectionScores).length ? sectionScores : undefined,
      timeTakenMins:  time ? parseInt(time) : undefined,
      notes:          notes || undefined,
    }, {
      onSuccess: () => {
        setOpen(false)
        setScores(Object.fromEntries(SECTIONS.map((s) => [s.key, ""])))
        setNotes("")
        setTime("")
      },
    })
  }

  const updateScore = (key: string, val: string) => {
    setScores((p) => ({ ...p, [key]: val }))
    setErrors((p) => ({ ...p, [key]: "" }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
  <div className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm
                  font-medium bg-primary text-primary-foreground
                  hover:bg-primary/90 transition-colors cursor-pointer">
    <Plus className="h-4 w-4" /> Log mock
  </div>
</DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log mock attempt</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">

          {/* Date + time row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mock-date">Date <span className="text-destructive">*</span></Label>
              <Input
                id="mock-date"
                type="date"
                value={date}
                onChange={(e) => { setDate(e.target.value); setErrors((p) => ({ ...p, date: "" })) }}
                className={cn(errors.date && "border-destructive")}
              />
              {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mock-time">Time taken (mins)</Label>
              <Input
                id="mock-time"
                type="number"
                min={1} max={120}
                placeholder="e.g. 60"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Section scores */}
          <div className="space-y-2">
            <Label>Section scores <span className="text-muted-foreground font-normal">(out of 50 each)</span></Label>
            <div className="grid grid-cols-2 gap-3">
              {SECTIONS.map((s) => (
                <div key={s.key} className="space-y-1">
                  <Label htmlFor={`score-${s.key}`} className="text-xs text-muted-foreground">
                    {s.label}
                  </Label>
                  <Input
                    id={`score-${s.key}`}
                    type="number"
                    min={0} max={s.max} step={0.5}
                    placeholder={`0–${s.max}`}
                    value={scores[s.key]}
                    onChange={(e) => updateScore(s.key, e.target.value)}
                    className={cn("text-center tabular-nums", errors[s.key] && "border-destructive")}
                  />
                  {errors[s.key] && <p className="text-[10px] text-destructive">{errors[s.key]}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Live total */}
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5">
            <span className="text-sm font-medium">Total score</span>
            <span className={cn(
              "text-lg font-bold tabular-nums",
              totalScore >= 136 ? "text-emerald-600 dark:text-emerald-400"
            : totalScore >= 100 ? "text-blue-600 dark:text-blue-400"
            :                      "text-muted-foreground"
            )}>
              {totalScore.toFixed(1)} / 200
            </span>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="mock-notes">Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea
              id="mock-notes"
              placeholder="What went well? Where did you lose time?"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving…" : "Save mock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
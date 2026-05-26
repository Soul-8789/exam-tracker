"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button }   from "@/components/ui/button"
import { cn }       from "@/lib/utils"
import {
  Upload, FileText, CheckCircle2, AlertCircle,
  Download, X, ChevronRight, Loader2,
} from "lucide-react"
import Papa from "papaparse"

type Step = "idle" | "preview" | "importing" | "done" | "error"

const REQUIRED = ["exam_name", "subject_name", "chapter_name"]
const VALID_PRI = ["fire", "high", "medium", "low"]

interface PreviewData {
  exams:    string[]
  subjects: Record<string, string[]>   // exam → subjects[]
  chapters: number
  errors:   string[]
}

interface Props {
  open:    boolean
  onClose: () => void
}

export function CsvImportDialog({ open, onClose }: Props) {
  const router      = useRouter()
  const qc          = useQueryClient()
  const inputRef    = useRef<HTMLInputElement>(null)
  const [step, setStep]         = useState<Step>("idle")
  const [file, setFile]         = useState<File | null>(null)
  const [preview, setPreview]   = useState<PreviewData | null>(null)
  const [result, setResult]     = useState<any>(null)
  const [errMsg, setErrMsg]     = useState("")
  const [dragging, setDragging] = useState(false)

  const reset = () => {
    setStep("idle"); setFile(null)
    setPreview(null); setResult(null); setErrMsg("")
  }

  const handleFile = useCallback((f: File) => {
    if (!f.name.endsWith(".csv")) {
      setErrMsg("Please upload a .csv file"); setStep("error"); return
    }
    setFile(f)

    // Client-side preview using PapaParse
    Papa.parse(f, {
      header:     true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows    = results.data as Record<string, string>[]
        const headers = results.meta.fields ?? []
        const errors: string[] = []

        // Check required columns
        REQUIRED.forEach(col => {
          if (!headers.includes(col))
            errors.push(`Missing required column: "${col}"`)
        })

        // Spot-check first 5 rows
        rows.slice(0, 5).forEach((r, i) => {
          if (!r.exam_name?.trim())   errors.push(`Row ${i+2}: exam_name empty`)
          if (!r.subject_name?.trim()) errors.push(`Row ${i+2}: subject_name empty`)
          if (!r.chapter_name?.trim()) errors.push(`Row ${i+2}: chapter_name empty`)
          if (r.priority && !VALID_PRI.includes(r.priority))
            errors.push(`Row ${i+2}: priority "${r.priority}" invalid`)
        })

        // Build tree preview
        const examSet = new Set<string>()
        const subMap:  Record<string, Set<string>> = {}

        rows.forEach(r => {
          const en = r.exam_name?.trim()
          const sn = r.subject_name?.trim()
          if (en) {
            examSet.add(en)
            if (!subMap[en]) subMap[en] = new Set()
            if (sn) subMap[en].add(sn)
          }
        })

        setPreview({
          exams:    [...examSet],
          subjects: Object.fromEntries(
            Object.entries(subMap).map(([k, v]) => [k, [...v]])
          ),
          chapters: rows.length,
          errors,
        })
        setStep("preview")
      },
      error: () => {
        setErrMsg("Failed to read CSV file")
        setStep("error")
      },
    })
  }, [])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleImport = async () => {
    if (!file) return
    setStep("importing")
    const fd = new FormData()
    fd.append("file", file)

    try {
      const res  = await fetch("/api/import", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) {
        setErrMsg(data.details?.join("\n") ?? data.error)
        setStep("error"); return
      }
      setResult(data)
      setStep("done")
      qc.invalidateQueries({ queryKey: ["exams"] })
      qc.invalidateQueries({ queryKey: ["custom-exams"] })
    } catch {
      setErrMsg("Network error. Please try again.")
      setStep("error")
    }
  }

  const downloadExample = () => {
    const csv = [
      "exam_name,exam_date,subject_name,subject_marks,subject_time_mins,chapter_name,page_range,priority,expected_qs,section",
      "My Exam,2026-12-01,Subject 1,100,30,Chapter 1 Name,,fire,3,section-a",
      "My Exam,2026-12-01,Subject 1,100,30,Chapter 2 Name,10-20,high,2,section-a",
      "My Exam,2026-12-01,Subject 2,100,30,Chapter 3 Name,,medium,1,section-b",
    ].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href = url; a.download = "tracker-template.csv"
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) { reset(); onClose() } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Import tracker from CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">

          {/* ── IDLE: drop zone ─────────────────────────────── */}
          {(step === "idle" || step === "error") && (
            <>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer",
                  "transition-all duration-150 flex flex-col items-center gap-3",
                  dragging
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                )}>
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  dragging ? "bg-primary/10" : "bg-muted"
                )}>
                  <Upload className={cn("h-6 w-6", dragging ? "text-primary" : "text-muted-foreground")} />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {dragging ? "Drop your CSV here" : "Drag & drop your CSV file"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or click to browse · .csv files only
                  </p>
                </div>
                <input ref={inputRef} type="file" accept=".csv" className="hidden"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </div>

              {step === "error" && (
                <div className="flex items-start gap-2 rounded-lg bg-destructive/10
                               border border-destructive/30 px-3 py-2.5">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive whitespace-pre-line">{errMsg}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Required columns: <code className="font-mono bg-muted px-1 rounded">exam_name</code>,
                  <code className="font-mono bg-muted px-1 rounded ml-1">subject_name</code>,
                  <code className="font-mono bg-muted px-1 rounded ml-1">chapter_name</code>
                </span>
                <button type="button" onClick={downloadExample}
                  className="flex items-center gap-1 text-primary hover:underline ml-3 flex-shrink-0">
                  <Download className="h-3 w-3" /> Download template
                </button>
              </div>
            </>
          )}

          {/* ── PREVIEW: show tree ─────────────────────────── */}
          {step === "preview" && preview && (
            <div className="space-y-3">
              {/* file pill */}
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm flex-1 truncate font-medium">{file?.name}</span>
                <button type="button" onClick={reset}
                  className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* validation errors */}
              {preview.errors.length > 0 && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3">
                  <p className="text-xs font-semibold text-destructive mb-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {preview.errors.length} validation error{preview.errors.length > 1 && "s"}
                  </p>
                  {preview.errors.map((e, i) => (
                    <p key={i} className="text-xs text-destructive">· {e}</p>
                  ))}
                </div>
              )}

              {/* summary stat pills */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Exams",    value: preview.exams.length,    icon: "📚" },
                  { label: "Subjects",  value: Object.values(preview.subjects).flat().length, icon: "📖" },
                  { label: "Chapters",  value: preview.chapters,         icon: "📄" },
                ].map(s => (
                  <div key={s.label} className="rounded-lg bg-muted/40 px-3 py-2.5 text-center">
                    <p className="text-xl font-bold tabular-nums">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.icon} {s.label}</p>
                  </div>
                ))}
              </div>

              {/* tree preview */}
              <div className="rounded-lg border border-border/60 max-h-48 overflow-y-auto">
                {preview.exams.map(exam => (
                  <div key={exam}>
                    <div className="flex items-center gap-2 px-3 py-2 bg-muted/30
                                   border-b border-border/40">
                      <span className="text-sm">📚</span>
                      <span className="text-sm font-semibold">{exam}</span>
                    </div>
                    {(preview.subjects[exam] ?? []).map(sub => (
                      <div key={sub}
                        className="flex items-center gap-2 px-5 py-1.5 text-xs
                                   text-muted-foreground border-b border-border/20">
                        <ChevronRight className="h-3 w-3 flex-shrink-0" />
                        <span className="text-foreground font-medium">{sub}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── IMPORTING ──────────────────────────────────── */}
          {step === "importing" && (
            <div className="flex flex-col items-center gap-4 py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center">
                <p className="text-sm font-medium">Importing your tracker…</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Creating exams, subjects and chapters in the database
                </p>
              </div>
            </div>
          )}

          {/* ── DONE ───────────────────────────────────────── */}
          {step === "done" && result && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40
                             flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold">Import successful! 🎉</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {result.stats.exams} exam · {result.stats.subjects} subjects · {result.stats.chapters} chapters created
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  onClose()
                  router.push(result.examId ? `/tracker/${result.examId}` : "/tracker")
                }}>
                Open tracker →
              </Button>
            </div>
          )}

        </div>

        <DialogFooter>
          {step === "idle" || step === "error" ? (
            <Button variant="outline" onClick={() => { reset(); onClose() }}>Cancel</Button>
          ) : step === "preview" ? (
            <>
              <Button variant="outline" onClick={reset}>
                ← Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={!!(preview?.errors.length)}>
                {preview?.errors.length
                  ? "Fix errors first"
                  : `Import ${preview?.chapters} chapters`}
              </Button>
            </>
          ) : step === "done" ? (
            <Button variant="outline" onClick={() => { reset(); onClose() }}>
              Close
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
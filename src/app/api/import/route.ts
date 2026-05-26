import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { exams, subjects, chapters } from "@/db/schema"

export const maxDuration = 30 // allow more time for large CSV files

type CsvRow = {
  exam_name:          string
  exam_date?:         string
  subject_name:       string
  subject_marks?:     string
  subject_time_mins?: string
  chapter_name:       string
  page_range?:        string
  priority?:          string
  expected_qs?:       string
  section?:           string
}

const REQUIRED_COLS = ["exam_name", "subject_name", "chapter_name"]
const VALID_PRIORITIES = ["fire", "high", "medium", "low"]

// Parse CSV text into rows — handles quoted fields and commas inside quotes
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []

  const parseLine = (line: string): string[] => {
    const result: string[] = []
    let cur = "", inQuote = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"' && !inQuote) { inQuote = true; continue }
      if (ch === '"' && inQuote)  { inQuote = false; continue }
      if (ch === "," && !inQuote)  { result.push(cur.trim()); cur = ""; continue }
      cur += ch
    }
    result.push(cur.trim())
    return result
  }

  const headers = parseLine(lines[0]).map(h => h.toLowerCase().trim())
  return lines.slice(1)
    .filter(l => l.trim())
    .map(line => {
      const vals = parseLine(line)
      return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]))
    })
}

// POST /api/import
// Body: FormData with field "file" containing the CSV
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  try {
    const formData = await req.formData()
    const file     = formData.get("file") as File | null
    if (!file)
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    if (!file.name.endsWith(".csv"))
      return NextResponse.json({ error: "File must be a .csv" }, { status: 400 })

    const text = await file.text()
    const rows = parseCSV(text) as CsvRow[]

    if (!rows.length)
      return NextResponse.json({ error: "CSV has no data rows" }, { status: 400 })

    // Validate required columns exist
    const headers = Object.keys(rows[0])
    const missing  = REQUIRED_COLS.filter(c => !headers.includes(c))
    if (missing.length)
      return NextResponse.json(
        { error: `Missing required columns: ${missing.join(", ")}` },
        { status: 400 }
      )

    // Validate row data
    const rowErrors: string[] = []
    rows.forEach((r, i) => {
      if (!r.exam_name?.trim())    rowErrors.push(`Row ${i+2}: exam_name is empty`)
      if (!r.subject_name?.trim())  rowErrors.push(`Row ${i+2}: subject_name is empty`)
      if (!r.chapter_name?.trim())  rowErrors.push(`Row ${i+2}: chapter_name is empty`)
      if (r.priority && !VALID_PRIORITIES.includes(r.priority))
        rowErrors.push(`Row ${i+2}: priority must be fire/high/medium/low`)
      if (r.exam_date && isNaN(Date.parse(r.exam_date)))
        rowErrors.push(`Row ${i+2}: exam_date must be YYYY-MM-DD`)
    })
    if (rowErrors.length)
      return NextResponse.json(
        { error: "Validation errors", details: rowErrors.slice(0, 10) },
        { status: 400 }
      )

    // ── Build unique exams / subjects / chapters in memory ──────
    const examMap:    Map<string, string> = new Map() // examName → examId
    const subjectMap: Map<string, string> = new Map() // "examId::subjectName" → subjectId

    let chaptersInserted = 0
    let subjectsInserted = 0
    let examsInserted    = 0
    let firstExamId: string | null = null

    for (const row of rows) {
      const examName    = row.exam_name.trim()
      const subjectName = row.subject_name.trim()
      const chapterName = row.chapter_name.trim()

      // ── Create exam if not seen yet ──────────────────────────
      if (!examMap.has(examName)) {
        const slug = examName.toLowerCase()
          .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
          + "-" + Date.now()

        const [exam] = await db.insert(exams).values({
          name:     examName,
          slug,
          examDate: row.exam_date?.trim() || null,
          isActive: true,
        }).returning()

        examMap.set(examName, exam.id)
        if (!firstExamId) firstExamId = exam.id
        examsInserted++
      }
      const examId = examMap.get(examName)!

      // ── Create subject if not seen yet for this exam ─────────
      const subKey = `${examId}::${subjectName}`
      if (!subjectMap.has(subKey)) {
        const [subject] = await db.insert(subjects).values({
          examId,
          name:            subjectName,
          totalMarks:      row.subject_marks ? parseInt(row.subject_marks) : 100,
          sectionTimeMins: row.subject_time_mins ? parseInt(row.subject_time_mins) : null,
          sortOrder:       subjectMap.size + 1,
        }).returning()

        subjectMap.set(subKey, subject.id)
        subjectsInserted++
      }
      const subjectId = subjectMap.get(subKey)!

      // ── Create chapter ───────────────────────────────────────
      const priority = VALID_PRIORITIES.includes(row.priority ?? "")
        ? row.priority as "fire" | "high" | "medium" | "low"
        : "medium"

      await db.insert(chapters).values({
        subjectId,
        name:       chapterName,
        pageRange:  row.page_range?.trim()  || null,
        priority,
        expectedQs: row.expected_qs ? parseInt(row.expected_qs) : 1,
        section:    row.section?.trim()     || null,
        sortOrder:  chaptersInserted + 1,
      })
      chaptersInserted++
    }

    return NextResponse.json({
      success:  true,
      examId:   firstExamId,
      stats: {
        exams:    examsInserted,
        subjects: subjectsInserted,
        chapters: chaptersInserted,
      },
    }, { status: 201 })

  } catch (err) {
    console.error("Import error:", err)
    return NextResponse.json(
      { error: "Import failed. Check your CSV format and try again." },
      { status: 500 }
    )
  }
}
import type { InferSelectModel } from "drizzle-orm"
import type { exams,notes,resources, subjects, chapters, userProgress, mockSessions, studySessions,plannerGoals } from "@/db/schema"
// lib/types.ts
// import { studySessions, plannerGoals } from "../db/planner-schema"

export type StudySession = InferSelectModel<typeof studySessions>
export type PlannerGoals = InferSelectModel<typeof plannerGoals>

export type Exam         = InferSelectModel<typeof exams>
export type Subject      = InferSelectModel<typeof subjects>
export type Chapter      = InferSelectModel<typeof chapters>
export type UserProgress = InferSelectModel<typeof userProgress>
export type MockSession  = InferSelectModel<typeof mockSessions>
export type Note     = InferSelectModel<typeof notes>
export type Resource = InferSelectModel<typeof resources>


// PATCH /api/progress body
export interface ProgressUpsert {
  chapterId: string
  status?:   "todo" | "in_progress" | "revision" | "done"
  scorePct?: number        // 0–100
  notes?:    string
  studyHours?: number
}

// POST /api/mocks body
export interface MockUpsert {
  examId:        string
  attemptedOn:   string  // ISO date string "2026-05-24"
  totalScore?:   number
  sectionScores?: Record<string, number> // { reasoning: 44, quant: 36 }
  timeTakenMins?: number
  notes?:        string
}

// GET /api/analytics response
export interface Analytics {
  totalChapters:    number
  done:             number
  inProgress:       number
  revision:         number
  todo:             number
  completionPct:    number
  avgScore:         number | null
  totalStudyHours:  number
  weakChapters:     Array<{ id: string; name: string; scorePct: number }>
  byPriority:       Record<string, { total: number; done: number }>
  mockHistory:      Array<{ date: string; score: number }>
}
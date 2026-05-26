// Add these imports to your existing schema.ts imports:
// pgTable, uuid, varchar, text, integer, boolean, date, timestamp, time, jsonb, index
// (most are already imported — just add `time` and `check` if missing)

import { pgTable, uuid, varchar, text, integer, boolean,
         date, timestamp, jsonb, index, time } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import {chapters} from "./schema"
import {exams} from "./schema"
// ── study_sessions ─────────────────────────────────────
// One row per planned study block (a chapter on a specific day + time)
export const studySessions = pgTable("study_sessions", {
  id:          uuid("id").primaryKey().defaultRandom(),
  userId:      varchar("user_id", { length: 100 }).notNull(),
  chapterId:   uuid("chapter_id").references(() => chapters.id, { onDelete: "cascade" }),
  title:       varchar("title", { length: 150 }).notNull(),
  date:        date("date").notNull(),
  startTime:   time("start_time"),
  endTime:     time("end_time"),
  durationMins:integer("duration_mins").default(60),
  color:       varchar("color", { length: 20 }).default("blue"),
  isCompleted: boolean("is_completed").default(false).notNull(),
  notes:       text("notes"),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("session_user_date_idx").on(t.userId, t.date),
])

// ── planner_goals ──────────────────────────────────────
// User's daily/weekly targets and preferences
export const plannerGoals = pgTable("planner_goals", {
  id:                uuid("id").primaryKey().defaultRandom(),
  userId:            varchar("user_id", { length: 100 }).notNull().unique(),
  dailyHoursTarget:  integer("daily_hours_target").default(3),
  weeklyChaptersTarget: integer("weekly_chapters_target").default(5),
  studyDays:         jsonb("study_days").default([1,2,3,4,5,6]), // 0=Sun … 6=Sat
  preferredStartTime:time("preferred_start_time").default("06:00"),
  sessionLengthMins: integer("session_length_mins").default(60),
  breakLengthMins:   integer("break_length_mins").default(15),
  examId:            uuid("exam_id").references(() => exams.id),
  updatedAt:         timestamp("updated_at").defaultNow().notNull(),
})

// Import these in schema.ts — add to existing exports:
// export { studySessions, plannerGoals } from "./planner-schema"
// or just paste the table definitions directly into schema.ts

// Add to TypeScript types in lib/types.ts:
// export type StudySession = InferSelectModel<typeof studySessions>
// export type PlannerGoals = InferSelectModel<typeof plannerGoals>
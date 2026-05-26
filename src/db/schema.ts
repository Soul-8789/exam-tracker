import {
  pgTable, pgEnum, uuid, varchar, text,
  integer, boolean, date, timestamp,
  decimal, jsonb, index,time
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { uniqueIndex } from "drizzle-orm/pg-core"  // add to existing import
// export { studySessions, plannerGoals } from "./planner-schema"
// ── Enums ─────────────────────────────────────────
export const priorityEnum = pgEnum("priority", [
  "fire", "high", "medium", "low"
])

export const statusEnum = pgEnum("progress_status", [
  "todo", "in_progress", "revision", "done"
])

// ── Exams ──────────────────────────────────────────
export const exams = pgTable("exams", {
  id:        uuid("id").primaryKey().defaultRandom(),
  name:      varchar("name", { length: 100 }).notNull(),
  slug:      varchar("slug", { length: 50 }).notNull().unique(),
  examDate:  date("exam_date"),
  isActive:  boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ── Subjects ───────────────────────────────────────
export const subjects = pgTable("subjects", {
  id:              uuid("id").primaryKey().defaultRandom(),
  examId:          uuid("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
  name:            varchar("name", { length: 100 }).notNull(),
  totalMarks:      integer("total_marks").default(50),
  sectionTimeMins: integer("section_time_mins").default(15),
  sortOrder:       integer("sort_order").default(0),
}, (t) => [index("subjects_exam_idx").on(t.examId)])

// ── Chapters ───────────────────────────────────────
export const chapters = pgTable("chapters", {
  id:         uuid("id").primaryKey().defaultRandom(),
  subjectId:  uuid("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  name:       varchar("name", { length: 150 }).notNull(),
  pageRange:  varchar("page_range", { length: 20 }),
  priority:   priorityEnum("priority").default("medium").notNull(),
  expectedQs: integer("expected_qs").default(1),
  section:    varchar("section", { length: 50 }),
  sortOrder:  integer("sort_order").default(0),
}, (t) => [index("chapters_subject_idx").on(t.subjectId)])

// ── User Progress ──────────────────────────────────
export const userProgress = pgTable("user_progress", {
  id:           uuid("id").primaryKey().defaultRandom(),
  userId:       varchar("user_id", { length: 100 }).notNull(),
  chapterId:    uuid("chapter_id").notNull().references(() => chapters.id, { onDelete: "cascade" }),
  status:       statusEnum("status").default("todo").notNull(),
  scorePct:     decimal("score_pct", { precision: 5, scale: 2 }),
  studyHours:   decimal("study_hours", { precision: 5, scale: 2 }).default("0"),
  notes:        text("notes"),
  lastStudiedAt:timestamp("last_studied_at"),
  updatedAt:    timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (t) => [
  index("progress_user_idx").on(t.userId),
  index("progress_chapter_idx").on(t.chapterId),
  uniqueIndex("progress_user_chapter_uniq").on(t.userId, t.chapterId),
])

// ── Mock Sessions ──────────────────────────────────
export const mockSessions = pgTable("mock_sessions", {
  id:            uuid("id").primaryKey().defaultRandom(),
  userId:        varchar("user_id", { length: 100 }).notNull(),
  examId:        uuid("exam_id").notNull().references(() => exams.id),
  attemptedOn:   date("attempted_on").notNull(),
  totalScore:    decimal("total_score", { precision: 6, scale: 2 }),
  sectionScores: jsonb("section_scores"),
  timeTakenMins: integer("time_taken_mins"),
  notes:         text("notes"),
  createdAt:     timestamp("created_at").defaultNow().notNull(),
}, (t) => [index("mock_user_idx").on(t.userId)])

// ─────────────────────────────────────────────────────────────────
// ADD THESE TO THE BOTTOM OF src/db/schema.ts
// Make sure all these are already in your pg-core import at the top:
//   pgTable, uuid, varchar, text, integer, boolean,
//   date, timestamp, jsonb, index, time
//
// If `time` is missing from your import, add it now:
//   import { ..., time } from "drizzle-orm/pg-core"
// ─────────────────────────────────────────────────────────────────

// ── study_sessions ─────────────────────────────────────────────
export const studySessions = pgTable("study_sessions", {
  id:           uuid("id").primaryKey().defaultRandom(),
  userId:       varchar("user_id", { length: 100 }).notNull(),
  chapterId:    uuid("chapter_id")
                  .references(() => chapters.id, { onDelete: "cascade" }),
  title:        varchar("title", { length: 150 }).notNull(),
  date:         date("date").notNull(),
  startTime:    time("start_time"),
  endTime:      time("end_time"),
  durationMins: integer("duration_mins").default(60),
  color:        varchar("color", { length: 20 }).default("blue"),
  isCompleted:  boolean("is_completed").default(false).notNull(),
  notes:        text("notes"),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("session_user_date_idx").on(t.userId, t.date),
])

// ── planner_goals ──────────────────────────────────────────────
export const plannerGoals = pgTable("planner_goals", {
  id:                   uuid("id").primaryKey().defaultRandom(),
  userId:               varchar("user_id", { length: 100 }).notNull().unique(),
  dailyHoursTarget:     integer("daily_hours_target").default(3),
  weeklyChaptersTarget: integer("weekly_chapters_target").default(5),
  studyDays:            jsonb("study_days").default([1,2,3,4,5,6]),
  preferredStartTime:   time("preferred_start_time").default("06:00"),
  sessionLengthMins:    integer("session_length_mins").default(60),
  breakLengthMins:      integer("break_length_mins").default(15),
  examId:               uuid("exam_id")
                          .references(() => exams.id, { onDelete: "set null" }),
  updatedAt:            timestamp("updated_at").defaultNow().notNull(),
})

// ── notes ───────────────────────────────────────────────────────
export const notes = pgTable("notes", {
  id:         uuid("id").primaryKey().defaultRandom(),
  userId:     varchar("user_id", { length: 100 }).notNull(),
  chapterId:  uuid("chapter_id")
                .references(() => chapters.id, { onDelete: "cascade" }),
  title:      varchar("title", { length: 200 }).notNull(),
  content:    text("content"),            // markdown
  tag:        varchar("tag", { length: 30 }), // formula|shortcut|mistake|revision|general
  isPinned:   boolean("is_pinned").default(false).notNull(),
  color:      varchar("color", { length: 20 }).default("yellow"),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
  updatedAt:  timestamp("updated_at").defaultNow().notNull()
               .$onUpdate(() => new Date()),
}, (t) => [
  index("note_user_idx").on(t.userId),
  index("note_chapter_idx").on(t.chapterId),
])

// ── resources ────────────────────────────────────────────────────
export const resources = pgTable("resources", {
  id:         uuid("id").primaryKey().defaultRandom(),
  userId:     varchar("user_id", { length: 100 }).notNull(),
  chapterId:  uuid("chapter_id")
                .references(() => chapters.id, { onDelete: "set null" }),
  title:      varchar("title", { length: 200 }).notNull(),
  url:        text("url").notNull(),
  type:       varchar("type", { length: 20 }).default("link"), // youtube|article|pdf|book|link
  description:text("description"),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("resource_user_idx").on(t.userId),
])

// Add to lib/types.ts:
// export type Note     = InferSelectModel<typeof notes>
// export type Resource = InferSelectModel<typeof resources>
// ── Relations ──────────────────────────────────────
export const examsRelations = relations(exams, ({ many }) => ({
  subjects: many(subjects),
  mockSessions: many(mockSessions),
}))
export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  exam: one(exams, { fields: [subjects.examId], references: [exams.id] }),
  chapters: many(chapters),
}))
export const chaptersRelations = relations(chapters, ({ one, many }) => ({
  subject: one(subjects, { fields: [chapters.subjectId], references: [subjects.id] }),
  progress: many(userProgress),
}))
export const userProgressRelations = relations(userProgress, ({ one }) => ({
  chapter: one(chapters, { fields: [userProgress.chapterId], references: [chapters.id] }),
}))
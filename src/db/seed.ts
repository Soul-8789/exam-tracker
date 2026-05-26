import "dotenv/config"
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { exams, subjects, chapters } from "./schema"

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

const reasoningChapters = [
  // Verbal & Analytical
  { name: "Coding – Decoding",             pageRange: "1–47",    priority: "fire",   expectedQs: 3, section: "verbal", sortOrder: 1  },
  { name: "Pair Formation",                 pageRange: "48–54",   priority: "low",    expectedQs: 0, section: "verbal", sortOrder: 2  },
  { name: "Letter Series",                  pageRange: "55–61",   priority: "fire",   expectedQs: 2, section: "verbal", sortOrder: 3  },
  { name: "Alphabetical Series",             pageRange: "62–72",   priority: "fire",   expectedQs: 2, section: "verbal", sortOrder: 4  },
  { name: "Word Formation",                 pageRange: "73–76",   priority: "low",    expectedQs: 1, section: "verbal", sortOrder: 5  },
  { name: "Dictionary",                     pageRange: "77–80",   priority: "low",    expectedQs: 1, section: "verbal", sortOrder: 6  },
  { name: "Jumbling",                        pageRange: "81–84",   priority: "low",    expectedQs: 1, section: "verbal", sortOrder: 7  },
  { name: "Number Series",                  pageRange: "85–96",   priority: "fire",   expectedQs: 3, section: "verbal", sortOrder: 8  },
  { name: "Missing Number",                 pageRange: "97–108",  priority: "medium", expectedQs: 1, section: "verbal", sortOrder: 9  },
  { name: "Analogy / Similarity",            pageRange: "109–118", priority: "fire",   expectedQs: 4, section: "verbal", sortOrder: 10 },
  { name: "Odd One Out (Classification)",    pageRange: "119–125", priority: "fire",   expectedQs: 3, section: "verbal", sortOrder: 11 },
  { name: "Coded Equation",                 pageRange: "126–132", priority: "medium", expectedQs: 1, section: "verbal", sortOrder: 12 },
  { name: "Dice",                           pageRange: "133–154", priority: "high",   expectedQs: 2, section: "verbal", sortOrder: 13 },
  { name: "Cube and Cuboid",                pageRange: "155–173", priority: "high",   expectedQs: 2, section: "verbal", sortOrder: 14 },
  { name: "Counting Figures",               pageRange: "174–196", priority: "fire",   expectedQs: 3, section: "verbal", sortOrder: 15 },
  { name: "Blood Relation",                 pageRange: "197–229", priority: "high",   expectedQs: 2, section: "verbal", sortOrder: 16 },
  { name: "Calendar",                       pageRange: "230–247", priority: "medium", expectedQs: 1, section: "verbal", sortOrder: 17 },
  { name: "Clock",                          pageRange: "248–269", priority: "medium", expectedQs: 1, section: "verbal", sortOrder: 18 },
  { name: "Direction and Distance",         pageRange: "270–296", priority: "high",   expectedQs: 2, section: "verbal", sortOrder: 19 },
  { name: "Syllogism",                      pageRange: "297–335", priority: "high",   expectedQs: 2, section: "verbal", sortOrder: 20 },
  { name: "Ranking Test",                   pageRange: "336–355", priority: "medium", expectedQs: 1, section: "verbal", sortOrder: 21 },
  { name: "Seating Arrangement",            pageRange: "356–387", priority: "high",   expectedQs: 2, section: "verbal", sortOrder: 22 },
  { name: "Puzzle",                         pageRange: "388–418", priority: "medium", expectedQs: 1, section: "verbal", sortOrder: 23 },
  { name: "Venn Diagram",                   pageRange: "419–438", priority: "high",   expectedQs: 2, section: "verbal", sortOrder: 24 },
  { name: "Inequality",                     pageRange: "439–455", priority: "high",   expectedQs: 2, section: "verbal", sortOrder: 25 },
  { name: "Machine Input-Output",           pageRange: "456–471", priority: "low",    expectedQs: 1, section: "verbal", sortOrder: 26 },
  { name: "Statement – Arguments",          pageRange: "472–478", priority: "low",    expectedQs: 1, section: "verbal", sortOrder: 27 },
  { name: "Statement – Assumptions",        pageRange: "479–487", priority: "medium", expectedQs: 1, section: "verbal", sortOrder: 28 },
  { name: "Statement – Conclusions",        pageRange: "488–496", priority: "medium", expectedQs: 1, section: "verbal", sortOrder: 29 },
  { name: "Statement – Courses of Action",  pageRange: "497–506", priority: "low",    expectedQs: 1, section: "verbal", sortOrder: 30 },
  { name: "Cause and Effect",              pageRange: "507–513", priority: "low",    expectedQs: 1, section: "verbal", sortOrder: 31 },
  { name: "Assertion and Reason",           pageRange: "514–517", priority: "low",    expectedQs: 1, section: "verbal", sortOrder: 32 },
  { name: "Decision Making",               pageRange: "518–524", priority: "low",    expectedQs: 1, section: "verbal", sortOrder: 33 },
  { name: "Data Sufficiency",              pageRange: "525–542", priority: "low",    expectedQs: 1, section: "verbal", sortOrder: 34 },
  { name: "Word-Based Problems",           pageRange: "543–551", priority: "low",    expectedQs: 1, section: "verbal", sortOrder: 35 },
  { name: "Matrix",                        pageRange: "552–557", priority: "low",    expectedQs: 1, section: "verbal", sortOrder: 36 },
  // Non-Verbal
  { name: "Mirror and Water Images",        pageRange: "558–564", priority: "high",   expectedQs: 2, section: "nonverbal", sortOrder: 37 },
  { name: "Paper Folding and Cutting",      pageRange: "565–570", priority: "high",   expectedQs: 1, section: "nonverbal", sortOrder: 38 },
  { name: "Embedded Figures",              pageRange: "571–576", priority: "medium", expectedQs: 1, section: "nonverbal", sortOrder: 39 },
  { name: "Completion of Figure",          pageRange: "577–582", priority: "medium", expectedQs: 1, section: "nonverbal", sortOrder: 40 },
  { name: "Grouping of Figures",           pageRange: "583–587", priority: "medium", expectedQs: 1, section: "nonverbal", sortOrder: 41 },
  { name: "Series (Non-verbal)",           pageRange: "588–592", priority: "high",   expectedQs: 1, section: "nonverbal", sortOrder: 42 },
  { name: "Analogy (Non-verbal)",          pageRange: "593–597", priority: "medium", expectedQs: 1, section: "nonverbal", sortOrder: 43 },
  { name: "Classification (Non-verbal)",   pageRange: "598–599", priority: "medium", expectedQs: 1, section: "nonverbal", sortOrder: 44 },
  { name: "Dot Situation",                pageRange: "600–601", priority: "low",    expectedQs: 1, section: "nonverbal", sortOrder: 45 },
  { name: "Figure Formation",             pageRange: "602–604", priority: "low",    expectedQs: 1, section: "nonverbal", sortOrder: 46 },
] as const

async function main() {
  console.log("🌱 Seeding database...")

  // 1. Insert exam
  const [exam] = await db
    .insert(exams)
    .values({ name: "SSC CGL 2026", slug: "ssc-cgl-2026", examDate: "2026-09-01" })
    .returning()
  console.log(`✓ Exam: ${exam.name}`)

  // 2. Insert subjects
  const subjectData = [
    { name: "General Intelligence & Reasoning", totalMarks: 50, sectionTimeMins: 15, sortOrder: 1 },
    { name: "General Awareness",                totalMarks: 50, sectionTimeMins: 15, sortOrder: 2 },
    { name: "Quantitative Aptitude",             totalMarks: 50, sectionTimeMins: 15, sortOrder: 3 },
    { name: "English Comprehension",             totalMarks: 50, sectionTimeMins: 15, sortOrder: 4 },
  ]
  const insertedSubjects = await db
    .insert(subjects)
    .values(subjectData.map(s => ({ ...s, examId: exam.id })))
    .returning()

  const reasoningSubject = insertedSubjects.find(s =>
    s.name.includes("Reasoning")
  )!
  console.log(`✓ Subjects: ${insertedSubjects.length} inserted`)

  // 3. Insert all 46 Reasoning chapters
  await db
    .insert(chapters)
    .values(reasoningChapters.map(c => ({
      ...c,
      subjectId: reasoningSubject.id,
      priority: c.priority as "fire" | "high" | "medium" | "low",
    })))
  console.log(`✓ Chapters: ${reasoningChapters.length} inserted`)

  console.log("✅ Seed complete!")
  process.exit(0)
}

main().catch(err => {
  console.error("❌ Seed failed:", err)
  process.exit(1)
})
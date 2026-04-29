import { sql } from "drizzle-orm";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/lib/db/schema";

async function debugIngest() {
  // Create an in-memory database for testing
  const sqlite = new Database(":memory:");
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });

  // Run migrations manually to set up tables
  const lecturesCreate = `
    CREATE TABLE lectures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lecture_id TEXT NOT NULL,
      title TEXT NOT NULL,
      lecture_number INTEGER NOT NULL,
      topics TEXT NOT NULL,
      question_count INTEGER NOT NULL DEFAULT 0,
      imported_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(lecture_id)
    )
  `;

  const questionsCreate = `
    CREATE TABLE questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lecture_fk INTEGER NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
      question_id TEXT NOT NULL,
      type TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      topic TEXT NOT NULL,
      stem TEXT NOT NULL,
      choices TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      mechanistic_explanation TEXT NOT NULL,
      distractor_analysis TEXT NOT NULL,
      trap_categories TEXT NOT NULL,
      diagram_ref TEXT,
      game_ref TEXT,
      UNIQUE(lecture_fk, question_id)
    )
  `;

  sqlite.exec(lecturesCreate);
  sqlite.exec(questionsCreate);

  // Create a test lecture
  const lectureResult = await db
    .insert(schema.lectures)
    .values({
      lectureId: "lecture-01-test",
      title: "Test Lecture",
      lectureNumber: 1,
      topics: ["topic1", "topic2"],
      questionCount: 3
    })
    .run();

  const lectures = await db
    .select({ id: schema.lectures.id })
    .from(schema.lectures)
    .where(sql`lecture_id = 'lecture-01-test'`)
    .all();

  console.log("Lectures:", lectures);

  const lectureId = lectures[0]?.id;
  if (!lectureId) {
    console.error("Failed to create lecture");
    return;
  }

  // Test the upsertQuestions logic
  const testRows = [
    {
      lectureFK: lectureId,
      questionId: "L01-Q01",
      type: "MECHANISM" as const,
      difficulty: "Foundational" as const,
      topic: "Test Topic 1",
      stem: "Test stem 1",
      choices: JSON.stringify([
        { id: "A", text: "Option A" },
        { id: "B", text: "Option B" }
      ]),
      correctAnswer: "A",
      mechanisticExplanation: "Explanation 1",
      distractorAnalysis: JSON.stringify({ B: "Distractor" }),
      trapCategories: JSON.stringify(["trap1"]),
      diagramRef: null,
      gameRef: null
    },
    {
      lectureFK: lectureId,
      questionId: "L01-Q02",
      type: "MECHANISM" as const,
      difficulty: "Foundational" as const,
      topic: "Test Topic 2",
      stem: "Test stem 2",
      choices: JSON.stringify([
        { id: "A", text: "Option A" },
        { id: "B", text: "Option B" }
      ]),
      correctAnswer: "B",
      mechanisticExplanation: "Explanation 2",
      distractorAnalysis: JSON.stringify({ A: "Distractor" }),
      trapCategories: JSON.stringify(["trap2"]),
      diagramRef: null,
      gameRef: null
    }
  ];

  // Generate the SQL
  const values = testRows.map(
    (row) => sql`(
      ${row.lectureFK},
      ${row.questionId},
      ${row.type},
      ${row.difficulty},
      ${row.topic},
      ${row.stem},
      ${row.choices},
      ${row.correctAnswer},
      ${row.mechanisticExplanation},
      ${row.distractorAnalysis},
      ${row.trapCategories},
      ${row.diagramRef},
      ${row.gameRef}
    )`
  );

  const insertQuery = sql`
    insert into questions (
      lecture_fk,
      question_id,
      type,
      difficulty,
      topic,
      stem,
      choices,
      correct_answer,
      mechanistic_explanation,
      distractor_analysis,
      trap_categories,
      diagram_ref,
      game_ref
    )
    values ${sql.join(values, sql`, `)}
    on conflict(lecture_fk, question_id) do update set
      type = excluded.type,
      difficulty = excluded.difficulty,
      topic = excluded.topic,
      stem = excluded.stem,
      choices = excluded.choices,
      correct_answer = excluded.correct_answer,
      mechanistic_explanation = excluded.mechanistic_explanation,
      distractor_analysis = excluded.distractor_analysis,
      trap_categories = excluded.trap_categories,
      diagram_ref = excluded.diagram_ref,
      game_ref = excluded.game_ref
  `;

  console.log("Generated SQL:");
  console.log(insertQuery);

  try {
    await db.run(insertQuery);
    console.log("Insert successful");
  } catch (error) {
    console.error("Insert failed:", error);
  }

  // Check what was inserted
  const questionsAfter = await db
    .select()
    .from(schema.questions)
    .all();

  console.log("Questions after insert:", questionsAfter.length);
  console.log("Questions:", questionsAfter);
}

debugIngest().catch(console.error);

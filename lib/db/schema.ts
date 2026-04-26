import { sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex
} from "drizzle-orm/sqlite-core";
import type { Choice, Difficulty, QuestionType } from "@/lib/types";

export const lectures = sqliteTable(
  "lectures",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    lectureId: text("lecture_id").notNull(),
    title: text("title").notNull(),
    lectureNumber: integer("lecture_number").notNull(),
    topics: text("topics", { mode: "json" }).$type<string[]>().notNull(),
    questionCount: integer("question_count").notNull().default(0),
    importedAt: text("imported_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => ({
    lectureIdUnique: uniqueIndex("lectures_lecture_id_unique").on(
      table.lectureId
    )
  })
);

export const questions = sqliteTable(
  "questions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    lectureFK: integer("lecture_fk")
      .notNull()
      .references(() => lectures.id, { onDelete: "cascade" }),
    questionId: text("question_id").notNull(),
    type: text("type").$type<QuestionType>().notNull(),
    difficulty: text("difficulty").$type<Difficulty>().notNull(),
    topic: text("topic").notNull(),
    stem: text("stem").notNull(),
    choices: text("choices", { mode: "json" }).$type<Choice[]>().notNull(),
    correctAnswer: text("correct_answer").notNull(),
    mechanisticExplanation: text("mechanistic_explanation").notNull(),
    distractorAnalysis: text("distractor_analysis", { mode: "json" })
      .$type<Record<string, string>>()
      .notNull(),
    trapCategories: text("trap_categories", { mode: "json" })
      .$type<string[]>()
      .notNull(),
    diagramRef: text("diagram_ref"),
    gameRef: text("game_ref")
  },
  (table) => ({
    lectureQuestionUnique: uniqueIndex("questions_lecture_question_unique").on(
      table.lectureFK,
      table.questionId
    ),
    lectureIdx: index("questions_lecture_idx").on(table.lectureFK),
    typeIdx: index("questions_type_idx").on(table.type),
    topicIdx: index("questions_topic_idx").on(table.topic)
  })
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    mode: text("mode").notNull(),
    lectureFK: integer("lecture_fk").references(() => lectures.id, {
      onDelete: "set null"
    }),
    startedAt: text("started_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    endedAt: text("ended_at"),
    questionsAttempted: integer("questions_attempted").notNull().default(0),
    questionsCorrect: integer("questions_correct").notNull().default(0)
  },
  (table) => ({
    modeIdx: index("sessions_mode_idx").on(table.mode)
  })
);

export const attempts = sqliteTable(
  "attempts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    questionFK: integer("question_fk")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    selectedAnswer: text("selected_answer").notNull(),
    isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
    timeSpentMs: integer("time_spent_ms").notNull(),
    attemptedAt: text("attempted_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    sessionId: text("session_id").notNull(),
    mode: text("mode").notNull()
  },
  (table) => ({
    questionIdx: index("attempts_question_idx").on(table.questionFK),
    sessionIdx: index("attempts_session_idx").on(table.sessionId),
    attemptedAtIdx: index("attempts_attempted_at_idx").on(table.attemptedAt)
  })
);

export const reviewQueue = sqliteTable(
  "review_queue",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    questionFK: integer("question_fk")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    easeFactor: integer("ease_factor").notNull().default(250),
    interval: integer("interval").notNull().default(0),
    nextReviewAt: text("next_review_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    consecutiveCorrect: integer("consecutive_correct").notNull().default(0)
  },
  (table) => ({
    questionUnique: uniqueIndex("review_queue_question_unique").on(
      table.questionFK
    ),
    nextReviewIdx: index("review_queue_next_review_idx").on(table.nextReviewAt)
  })
);

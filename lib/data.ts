import { and, desc, eq, lte, sql } from "drizzle-orm";
import fs from "node:fs";
import path from "node:path";
import { getDb, schema, type CipherDrillDb } from "@/lib/db";
import {
  DIFFICULTIES,
  QUESTION_TYPES,
  type AnalyticsData,
  type AnalyticsDatum,
  type ConceptHeading,
  type ConceptPrimer,
  type DashboardStats,
  type Difficulty,
  type HeatmapCell,
  type LectureCardData,
  type ReadinessScore,
  type SerializableQuestion
} from "@/lib/types";

const { attempts, lectures, questions, reviewQueue } = schema;

type QuestionJoinRow = {
  dbId: number;
  questionId: string;
  type: SerializableQuestion["type"];
  difficulty: Difficulty;
  topic: string;
  stem: string;
  choices: SerializableQuestion["choices"];
  correctAnswer: string;
  mechanisticExplanation: string;
  distractorAnalysis: Record<string, string>;
  trapCategories: string[];
  diagramRef: string | null;
  gameRef: string | null;
  lectureId: string;
  lectureTitle: string;
  lectureNumber: number;
};

type AttemptRollup = {
  attempts: number;
  correct: number;
  lastCorrect: boolean | null;
};

function pct(correct: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  return Math.round((correct / total) * 100);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function getAttemptRollup(
  db: CipherDrillDb,
  questionId: number
): Promise<AttemptRollup> {
  const rows = await db
    .select({
      isCorrect: attempts.isCorrect,
      attemptedAt: attempts.attemptedAt
    })
    .from(attempts)
    .where(eq(attempts.questionFK, questionId))
    .orderBy(desc(attempts.attemptedAt))
    .all();

  return {
    attempts: rows.length,
    correct: rows.filter((row) => row.isCorrect).length,
    lastCorrect: rows[0]?.isCorrect ?? null
  };
}

async function isDue(db: CipherDrillDb, questionId: number): Promise<boolean> {
  const due = await db
    .select({ id: reviewQueue.id })
    .from(reviewQueue)
    .where(
      and(
        eq(reviewQueue.questionFK, questionId),
        lte(reviewQueue.nextReviewAt, new Date().toISOString())
      )
    )
    .get();
  return Boolean(due);
}

async function toSerializableQuestion(
  db: CipherDrillDb,
  row: QuestionJoinRow
): Promise<SerializableQuestion> {
  const rollup = await getAttemptRollup(db, row.dbId);
  return {
    dbId: row.dbId,
    id: row.questionId,
    type: row.type,
    difficulty: row.difficulty,
    topic: row.topic,
    stem: row.stem,
    choices: row.choices,
    correctAnswer: row.correctAnswer,
    mechanisticExplanation: row.mechanisticExplanation,
    distractorAnalysis: row.distractorAnalysis,
    trapCategories: row.trapCategories,
    diagramRef: row.diagramRef,
    gameRef: row.gameRef,
    lectureId: row.lectureId,
    lectureTitle: row.lectureTitle,
    lectureNumber: row.lectureNumber,
    attempts: rollup.attempts,
    correctAttempts: rollup.correct,
    dueForReview: await isDue(db, row.dbId),
    lastAttemptCorrect: rollup.lastCorrect
  };
}

function questionSelect(db: CipherDrillDb) {
  return db
    .select({
      dbId: questions.id,
      questionId: questions.questionId,
      type: questions.type,
      difficulty: questions.difficulty,
      topic: questions.topic,
      stem: questions.stem,
      choices: questions.choices,
      correctAnswer: questions.correctAnswer,
      mechanisticExplanation: questions.mechanisticExplanation,
      distractorAnalysis: questions.distractorAnalysis,
      trapCategories: questions.trapCategories,
      diagramRef: questions.diagramRef,
      gameRef: questions.gameRef,
      lectureId: lectures.lectureId,
      lectureTitle: lectures.title,
      lectureNumber: lectures.lectureNumber
    })
    .from(questions)
    .innerJoin(lectures, eq(questions.lectureFK, lectures.id));
}

export async function getAllQuestions(): Promise<SerializableQuestion[]> {
  const db = await getDb();
  const rows = await questionSelect(db)
    .orderBy(lectures.lectureNumber, questions.questionId)
    .all();

  return Promise.all(rows.map((row) => toSerializableQuestion(db, row)));
}

export async function getLectureQuestions(lectureId: string): Promise<{
  lecture: LectureCardData | null;
  questions: SerializableQuestion[];
}> {
  const db = await getDb();
  const dashboardStats = await getDashboardStats();
  const lecture = dashboardStats.lectures.find(
    (item) => item.lectureId === lectureId
  );

  const rows = await questionSelect(db)
    .where(eq(lectures.lectureId, lectureId))
    .orderBy(questions.questionId)
    .all();

  return {
    lecture: lecture ?? null,
    questions: await Promise.all(
      rows.map((row) => toSerializableQuestion(db, row))
    )
  };
}

export async function getReviewQuestions(lectureId: string): Promise<{
  lecture: LectureCardData | null;
  questions: SerializableQuestion[];
}> {
  const payload = await getLectureQuestions(lectureId);
  return {
    lecture: payload.lecture,
    questions: payload.questions.filter(
      (question) => question.lastAttemptCorrect === false || question.dueForReview
    )
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = await getDb();
  const lectureRows = await db
    .select()
    .from(lectures)
    .orderBy(lectures.lectureNumber)
    .all();

  const attemptRows = await db
    .select({
      id: attempts.id,
      isCorrect: attempts.isCorrect,
      attemptedAt: attempts.attemptedAt
    })
    .from(attempts)
    .orderBy(desc(attempts.attemptedAt))
    .all();

  const lectureCards: LectureCardData[] = await Promise.all(
    lectureRows.map(async (lecture) => {
      const questionRows = await db
        .select({
          id: questions.id,
          trapCategories: questions.trapCategories
        })
        .from(questions)
        .where(eq(questions.lectureFK, lecture.id))
        .all();
      const questionIds = new Set(questionRows.map((question) => question.id));
      const lectureAttempts = (
        await db
          .select({
            questionFK: attempts.questionFK,
            isCorrect: attempts.isCorrect,
            attemptedAt: attempts.attemptedAt
          })
          .from(attempts)
          .all()
      ).filter((attempt) => questionIds.has(attempt.questionFK));

      const trapMisses = new Map<string, number>();
      for (const attempt of lectureAttempts) {
        if (attempt.isCorrect) {
          continue;
        }
        const question = questionRows.find((item) => item.id === attempt.questionFK);
        for (const trap of question?.trapCategories ?? []) {
          trapMisses.set(trap, (trapMisses.get(trap) ?? 0) + 1);
        }
      }

      const weakestTrapCategory =
        [...trapMisses.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
      const correctAttempts = lectureAttempts.filter((attempt) => attempt.isCorrect)
        .length;
      const lastAttemptedAt =
        lectureAttempts.sort((a, b) =>
          b.attemptedAt.localeCompare(a.attemptedAt)
        )[0]?.attemptedAt ?? null;

      return {
        id: lecture.id,
        lectureId: lecture.lectureId,
        title: lecture.title,
        lectureNumber: lecture.lectureNumber,
        topics: lecture.topics,
        questionCount: lecture.questionCount,
        importedAt: lecture.importedAt,
        lastAttemptedAt,
        attempts: lectureAttempts.length,
        correctAttempts,
        accuracy:
          lectureAttempts.length === 0
            ? null
            : pct(correctAttempts, lectureAttempts.length),
        weakestTrapCategory
      };
    })
  );

  let currentStreak = 0;
  for (const attempt of attemptRows) {
    if (!attempt.isCorrect) {
      break;
    }
    currentStreak += 1;
  }

  const totalCorrect = attemptRows.filter((attempt) => attempt.isCorrect).length;

  return {
    totalQuestions: lectureCards.reduce(
      (sum, lecture) => sum + lecture.questionCount,
      0
    ),
    totalAttempts: attemptRows.length,
    overallAccuracy:
      attemptRows.length === 0 ? null : pct(totalCorrect, attemptRows.length),
    currentStreak,
    lectures: lectureCards
  };
}

export async function getWeakestTrapCategories(limit = 3): Promise<string[]> {
  const analyticsData = await getAnalyticsData();
  return analyticsData.accuracyByTrapCategory
    .filter((item) => item.attempts > 0)
    .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts)
    .slice(0, limit)
    .map((item) => item.name);
}

export function getConceptPrimer(lectureId: string): ConceptPrimer {
  const primerPath = path.join(process.cwd(), "concept-primers", `${lectureId}.md`);
  if (!fs.existsSync(primerPath)) {
    return { lectureId, content: null, headings: [] };
  }

  const content = fs.readFileSync(primerPath, "utf8");
  const headings: ConceptHeading[] = content
    .split("\n")
    .map((line) => /^(#{1,3})\s+(.+)$/.exec(line))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => ({
      id: slugify(match[2]),
      text: match[2],
      level: match[1].length
    }));

  return { lectureId, content, headings };
}

function upsertMetric(
  map: Map<string, { correct: number; attempts: number }>,
  key: string,
  isCorrect: boolean
): void {
  const current = map.get(key) ?? { correct: 0, attempts: 0 };
  current.attempts += 1;
  if (isCorrect) {
    current.correct += 1;
  }
  map.set(key, current);
}

function toAnalyticsData(map: Map<string, { correct: number; attempts: number }>): AnalyticsDatum[] {
  return [...map.entries()]
    .map(([name, value]) => ({
      name,
      attempts: value.attempts,
      correct: value.correct,
      accuracy: pct(value.correct, value.attempts)
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function computeReadiness(
  db: CipherDrillDb,
  totalQuestions: number,
  uniqueAttempted: number
): Promise<ReadinessScore> {
  const attemptRows = await db
    .select({
      questionFK: attempts.questionFK,
      isCorrect: attempts.isCorrect,
      attemptedAt: attempts.attemptedAt
    })
    .from(attempts)
    .all();

  const coverage = totalQuestions === 0 ? 0 : uniqueAttempted / totalQuestions;
  const accuracy =
    attemptRows.length === 0
      ? 0
      : attemptRows.filter((attempt) => attempt.isCorrect).length / attemptRows.length;
  const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;
  const recentlyAttempted = new Set(
    attemptRows
      .filter((attempt) => new Date(attempt.attemptedAt).getTime() >= tenDaysAgo)
      .map((attempt) => attempt.questionFK)
  );
  const recency = totalQuestions === 0 ? 0 : recentlyAttempted.size / totalQuestions;
  const score = Math.round((coverage * 0.35 + accuracy * 0.45 + recency * 0.2) * 100);

  return {
    score,
    coverage: Math.round(coverage * 100),
    accuracy: Math.round(accuracy * 100),
    recency: Math.round(recency * 100),
    explanation:
      "Score = 35% coverage + 45% accuracy + 20% recent coverage from the last 10 days."
  };
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const db = await getDb();
  const rows = await db
    .select({
      isCorrect: attempts.isCorrect,
      attemptedAt: attempts.attemptedAt,
      questionFK: attempts.questionFK,
      lectureTitle: lectures.title,
      type: questions.type,
      topic: questions.topic,
      difficulty: questions.difficulty,
      trapCategories: questions.trapCategories
    })
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionFK, questions.id))
    .innerJoin(lectures, eq(questions.lectureFK, lectures.id))
    .all();

  const totalQuestions =
    (
      await db
        .select({ count: sql<number>`count(*)` })
        .from(questions)
        .get()
    )?.count ?? 0;
  const uniqueAttempted = new Set(rows.map((row) => row.questionFK)).size;

  const byDate = new Map<string, { correct: number; attempts: number }>();
  const byLecture = new Map<string, { correct: number; attempts: number }>();
  const byType = new Map<string, { correct: number; attempts: number }>();
  const byTrap = new Map<string, { correct: number; attempts: number }>();
  const byHeatmap = new Map<string, { correct: number; attempts: number }>();

  for (const row of rows) {
    const day = row.attemptedAt.slice(0, 10);
    upsertMetric(byDate, day, row.isCorrect);
    upsertMetric(byLecture, row.lectureTitle, row.isCorrect);
    upsertMetric(byType, row.type, row.isCorrect);
    upsertMetric(byHeatmap, `${row.topic}|||${row.difficulty}`, row.isCorrect);
    for (const trap of row.trapCategories) {
      upsertMetric(byTrap, trap, row.isCorrect);
    }
  }

  for (const type of QUESTION_TYPES) {
    if (!byType.has(type)) {
      byType.set(type, { correct: 0, attempts: 0 });
    }
  }

  const allQuestionRows = await db
    .select({
      topic: questions.topic,
      difficulty: questions.difficulty
    })
    .from(questions)
    .all();
  for (const question of allQuestionRows) {
    const key = `${question.topic}|||${question.difficulty}`;
    if (!byHeatmap.has(key)) {
      byHeatmap.set(key, { correct: 0, attempts: 0 });
    }
  }

  const heatmap: HeatmapCell[] = [...byHeatmap.entries()]
    .map(([key, value]) => {
      const [topic, difficulty] = key.split("|||") as [string, Difficulty];
      return {
        topic,
        difficulty,
        attempts: value.attempts,
        correct: value.correct,
        accuracy: value.attempts === 0 ? null : pct(value.correct, value.attempts)
      };
    })
    .sort(
      (a, b) =>
        a.topic.localeCompare(b.topic) ||
        DIFFICULTIES.indexOf(a.difficulty) - DIFFICULTIES.indexOf(b.difficulty)
    );

  return {
    accuracyOverTime: toAnalyticsData(byDate).map((item) => ({
      date: item.name,
      accuracy: item.accuracy,
      attempts: item.attempts
    })),
    accuracyByLecture: toAnalyticsData(byLecture),
    accuracyByType: toAnalyticsData(byType),
    accuracyByTrapCategory: toAnalyticsData(byTrap).sort(
      (a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts
    ),
    heatmap,
    readiness: await computeReadiness(db, totalQuestions, uniqueAttempted)
  };
}

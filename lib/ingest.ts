import Ajv, { type AnySchema, type ErrorObject, type ValidateFunction } from "ajv";
import { eq, inArray, sql } from "drizzle-orm";
import fs from "node:fs";
import path from "node:path";
import { getDb, schema, type CipherDrillDb } from "@/lib/db";
import type {
  IngestSummary,
  IngestValidationError,
  QuestionBank,
  QuestionBankQuestion
} from "@/lib/types";

const { lectures, questions } = schema;

type QuestionUpsertRow = {
  lectureFK: number;
  questionId: string;
  type: QuestionBankQuestion["type"];
  difficulty: QuestionBankQuestion["difficulty"];
  topic: string;
  stem: string;
  choices: QuestionBankQuestion["choices"];
  correctAnswer: string;
  mechanisticExplanation: string;
  distractorAnalysis: QuestionBankQuestion["distractorAnalysis"];
  trapCategories: QuestionBankQuestion["trapCategories"];
  diagramRef: string | null;
  gameRef: string | null;
};

function loadSchema(cwd: string): unknown {
  const schemaPath = path.join(cwd, "question-banks", "_schema.json");
  return JSON.parse(fs.readFileSync(schemaPath, "utf8")) as unknown;
}

function formatAjvError(filePath: string, error: ErrorObject): IngestValidationError {
  const additional =
    typeof error.params.additionalProperty === "string"
      ? ` (${error.params.additionalProperty})`
      : "";

  return {
    filePath,
    fieldPath: error.instancePath || "/",
    message: `${error.message ?? "failed validation"}${additional}`
  };
}

function listQuestionBankFiles(cwd: string): string[] {
  const questionBankDir = path.join(cwd, "question-banks");
  if (!fs.existsSync(questionBankDir)) {
    return [];
  }

  return fs
    .readdirSync(questionBankDir)
    .filter((file) => file.endsWith(".json"))
    .filter((file) => file !== "_schema.json")
    .sort()
    .map((file) => path.join(questionBankDir, file));
}

function listPrimerLectureIds(cwd: string): Set<string> {
  const primerDir = path.join(cwd, "concept-primers");
  if (!fs.existsSync(primerDir)) {
    return new Set();
  }

  return new Set(
    fs
      .readdirSync(primerDir)
      .filter((file) => file.endsWith(".md"))
      .filter((file) => file !== "README.md")
      .map((file) => file.replace(/\.md$/, ""))
  );
}

function validateBank(
  filePath: string,
  validate: ValidateFunction<QuestionBank>
): { bank: QuestionBank | null; errors: IngestValidationError[] } {
  let parsed: unknown;

  try {
    parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as unknown;
  } catch (error) {
    return {
      bank: null,
      errors: [
        {
          filePath,
          fieldPath: "/",
          message:
            error instanceof Error
              ? `Invalid JSON: ${error.message}`
              : "Invalid JSON"
        }
      ]
    };
  }

  if (!validate(parsed)) {
    return {
      bank: null,
      errors: (validate.errors ?? []).map((error) =>
        formatAjvError(filePath, error)
      )
    };
  }

  return { bank: parsed, errors: [] };
}

async function upsertQuestions(
  db: CipherDrillDb,
  rows: QuestionUpsertRow[]
): Promise<void> {
  if (rows.length === 0) {
    return;
  }

  await db
    .insert(questions)
    .values(rows)
    .onConflictDoUpdate({
      target: [questions.lectureFK, questions.questionId],
      set: {
        type: sql`excluded.type`,
        difficulty: sql`excluded.difficulty`,
        topic: sql`excluded.topic`,
        stem: sql`excluded.stem`,
        choices: sql`excluded.choices`,
        correctAnswer: sql`excluded.correct_answer`,
        mechanisticExplanation: sql`excluded.mechanistic_explanation`,
        distractorAnalysis: sql`excluded.distractor_analysis`,
        trapCategories: sql`excluded.trap_categories`,
        diagramRef: sql`excluded.diagram_ref`,
        gameRef: sql`excluded.game_ref`
      }
    })
    .run();
}

async function upsertBank(
  db: CipherDrillDb,
  bank: QuestionBank
): Promise<"ingested" | "updated"> {
  const existing = await db
    .select({ id: lectures.id })
    .from(lectures)
    .where(eq(lectures.lectureId, bank.lectureId))
    .get();

  await db
    .insert(lectures)
    .values({
      lectureId: bank.lectureId,
      title: bank.lectureTitle,
      lectureNumber: bank.lectureNumber,
      topics: bank.topics,
      questionCount: bank.questions.length,
      importedAt: new Date().toISOString()
    })
    .onConflictDoUpdate({
      target: lectures.lectureId,
      set: {
        title: bank.lectureTitle,
        lectureNumber: bank.lectureNumber,
        topics: bank.topics,
        questionCount: bank.questions.length,
        importedAt: new Date().toISOString()
      }
    })
    .run();

  const lecture = await db
    .select({ id: lectures.id })
    .from(lectures)
    .where(eq(lectures.lectureId, bank.lectureId))
    .get();

  if (!lecture) {
    throw new Error(`Lecture upsert failed for ${bank.lectureId}`);
  }

  const incomingQuestionIds = bank.questions.map((question) => question.id);

  await upsertQuestions(
    db,
    bank.questions.map((question) => ({
      lectureFK: lecture.id,
      questionId: question.id,
      type: question.type,
      difficulty: question.difficulty,
      topic: question.topic,
      stem: question.stem,
      choices: question.choices,
      correctAnswer: question.correctAnswer,
      mechanisticExplanation: question.mechanisticExplanation,
      distractorAnalysis: question.distractorAnalysis,
      trapCategories: question.trapCategories,
      diagramRef: question.diagramRef,
      gameRef: question.gameRef
    }))
  );

  const existingQuestions = await db
    .select({ id: questions.id, questionId: questions.questionId })
    .from(questions)
    .where(eq(questions.lectureFK, lecture.id))
    .all();

  const incomingSet = new Set(incomingQuestionIds);
  const orphanIds = existingQuestions
    .filter((question) => !incomingSet.has(question.questionId))
    .map((question) => question.id);

  if (orphanIds.length > 0) {
    await db.delete(questions).where(inArray(questions.id, orphanIds)).run();
  }

  return existing ? "updated" : "ingested";
}

export async function ingestQuestionBanks(
  cwd = process.cwd()
): Promise<IngestSummary> {
  const db = await getDb();
  const schema = loadSchema(cwd);
  const ajv = new Ajv({
    allErrors: true,
    allowUnionTypes: true
  });
  const validate = ajv.compile<QuestionBank>(schema as AnySchema);
  const files = listQuestionBankFiles(cwd);
  const primerLectureIds = listPrimerLectureIds(cwd);
  const summary: IngestSummary = {
    ingested: 0,
    updated: 0,
    primersLinked: 0,
    errors: []
  };

  for (const filePath of files) {
    const result = validateBank(filePath, validate);
    if (!result.bank) {
      summary.errors.push(...result.errors);
      continue;
    }

    const bank = result.bank;
    try {
      const state = await upsertBank(db, bank);
      if (state === "ingested") {
        summary.ingested += 1;
      } else {
        summary.updated += 1;
      }

      if (primerLectureIds.has(bank.lectureId)) {
        summary.primersLinked += 1;
      }
    } catch (error) {
      summary.errors.push({
        filePath,
        fieldPath: "/",
        message:
          error instanceof Error ? `Database error: ${error.message}` : "Database error"
      });
    }
  }

  return summary;
}

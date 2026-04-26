import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, schema } from "@/lib/db";
import { markQuestionForReview, recordSrsResult } from "@/lib/srs";

export const runtime = "nodejs";

const { attempts, questions, sessions } = schema;

const modeSchema = z.enum(["practice", "review", "mixed"]);

const answerSchema = z.object({
  kind: z.literal("answer"),
  questionId: z.number().int().positive(),
  selectedAnswer: z.string().min(1).max(8),
  timeSpentMs: z.number().int().nonnegative(),
  sessionId: z.string().uuid(),
  mode: modeSchema
});

const markSchema = z.object({
  kind: z.literal("mark"),
  questionId: z.number().int().positive()
});

const requestSchema = z.discriminatedUnion("kind", [answerSchema, markSchema]);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const db = await getDb();
  const question = await db
    .select({
      id: questions.id,
      lectureFK: questions.lectureFK,
      correctAnswer: questions.correctAnswer
    })
    .from(questions)
    .where(eq(questions.id, parsed.data.questionId))
    .get();

  if (!question) {
    return NextResponse.json({ error: "Question not found." }, { status: 404 });
  }

  if (parsed.data.kind === "mark") {
    await markQuestionForReview(question.id);
    return NextResponse.json({ marked: true });
  }

  const answer = parsed.data;
  const isCorrect = answer.selectedAnswer === question.correctAnswer;
  const now = new Date().toISOString();

  await db
    .insert(sessions)
    .values({
      id: answer.sessionId,
      mode: answer.mode,
      lectureFK: question.lectureFK,
      startedAt: now,
      endedAt: now,
      questionsAttempted: 0,
      questionsCorrect: 0
    })
    .onConflictDoNothing()
    .run();

  await db
    .insert(attempts)
    .values({
      questionFK: question.id,
      selectedAnswer: answer.selectedAnswer,
      isCorrect,
      timeSpentMs: answer.timeSpentMs,
      attemptedAt: now,
      sessionId: answer.sessionId,
      mode: answer.mode
    })
    .run();

  await db
    .update(sessions)
    .set({
      endedAt: now,
      questionsAttempted: sql`${sessions.questionsAttempted} + 1`,
      questionsCorrect: sql`${sessions.questionsCorrect} + ${isCorrect ? 1 : 0}`
    })
    .where(eq(sessions.id, answer.sessionId))
    .run();

  await recordSrsResult(question.id, isCorrect);

  return NextResponse.json({
    isCorrect,
    correctAnswer: question.correctAnswer
  });
}

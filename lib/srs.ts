import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";

const { reviewQueue } = schema;

function addDays(date: Date, days: number): string {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString();
}

export async function markQuestionForReview(questionId: number): Promise<void> {
  const db = await getDb();

  await db
    .insert(reviewQueue)
    .values({
      questionFK: questionId,
      easeFactor: 230,
      interval: 0,
      nextReviewAt: new Date().toISOString(),
      consecutiveCorrect: 0
    })
    .onConflictDoUpdate({
      target: reviewQueue.questionFK,
      set: {
        nextReviewAt: new Date().toISOString(),
        consecutiveCorrect: 0
      }
    })
    .run();
}

export async function recordSrsResult(
  questionId: number,
  isCorrect: boolean
): Promise<void> {
  const db = await getDb();
  const existing = await db
    .select()
    .from(reviewQueue)
    .where(eq(reviewQueue.questionFK, questionId))
    .get();

  if (!isCorrect) {
    await db
      .insert(reviewQueue)
      .values({
        questionFK: questionId,
        easeFactor: Math.max(130, (existing?.easeFactor ?? 250) - 20),
        interval: 0,
        nextReviewAt: new Date().toISOString(),
        consecutiveCorrect: 0
      })
      .onConflictDoUpdate({
        target: reviewQueue.questionFK,
        set: {
          easeFactor: Math.max(130, (existing?.easeFactor ?? 250) - 20),
          interval: 0,
          nextReviewAt: new Date().toISOString(),
          consecutiveCorrect: 0
        }
      })
      .run();
    return;
  }

  if (!existing) {
    return;
  }

  const consecutiveCorrect = existing.consecutiveCorrect + 1;
  if (consecutiveCorrect >= 2) {
    await db.delete(reviewQueue).where(eq(reviewQueue.questionFK, questionId)).run();
    return;
  }

  const easeFactor = Math.min(300, existing.easeFactor + 10);
  const interval =
    existing.interval === 0
      ? 1
      : Math.max(1, Math.ceil(existing.interval * (easeFactor / 100)));

  await db
    .update(reviewQueue)
    .set({
      easeFactor,
      interval,
      nextReviewAt: addDays(new Date(), interval),
      consecutiveCorrect
    })
    .where(eq(reviewQueue.questionFK, questionId))
    .run();
}

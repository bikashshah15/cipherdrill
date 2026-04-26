import { notFound } from "next/navigation";
import { PracticeClient } from "@/components/practice-client";
import { getReviewQuestions } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ReviewPage({
  params
}: {
  params: { lectureId: string };
}) {
  const payload = await getReviewQuestions(params.lectureId);

  if (!payload.lecture) {
    notFound();
  }

  return (
    <PracticeClient
      title={`${payload.lecture.title} review`}
      lectureId={params.lectureId}
      questions={payload.questions}
      mode="review"
    />
  );
}

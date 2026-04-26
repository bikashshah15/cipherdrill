import { notFound } from "next/navigation";
import { PracticeClient } from "@/components/practice-client";
import { getLectureQuestions } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function LecturePracticePage({
  params,
  searchParams
}: {
  params: { lectureId: string };
  searchParams: { topic?: string };
}) {
  const payload = await getLectureQuestions(params.lectureId);

  if (!payload.lecture) {
    notFound();
  }

  return (
    <PracticeClient
      title={payload.lecture.title}
      lectureId={params.lectureId}
      questions={payload.questions}
      mode="practice"
      initialTopic={searchParams.topic ?? ""}
    />
  );
}

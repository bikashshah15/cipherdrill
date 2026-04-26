import { PracticeClient } from "@/components/practice-client";
import { getAllQuestions, getWeakestTrapCategories } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function MixedPracticePage() {
  return (
    <PracticeClient
      title="Cross-lecture mixed mode"
      questions={await getAllQuestions()}
      mode="mixed"
      weakestTrapCategories={await getWeakestTrapCategories()}
      showLectureLabels
    />
  );
}

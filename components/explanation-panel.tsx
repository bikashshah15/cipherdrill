"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { TrapBadge } from "@/components/trap-badge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SerializableQuestion } from "@/lib/types";

export function ExplanationPanel({
  question,
  selectedAnswer,
  visible
}: {
  question: SerializableQuestion;
  selectedAnswer: string | null;
  visible: boolean;
}) {
  if (!visible) {
    return null;
  }

  const correct = selectedAnswer === question.correctAnswer;

  return (
    <section className="rounded-lg border bg-card p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {correct ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : (
            <XCircle className="h-5 w-5 text-rose-400" />
          )}
          <h2 className="text-base font-semibold">
            {correct ? "Correct mechanism" : "Mechanism correction"}
          </h2>
        </div>
        <Badge className={cn(correct ? "bg-emerald-600" : "bg-rose-600")}>
          Answer {question.correctAnswer}
        </Badge>
      </div>

      <div className="rounded-md border border-primary/30 bg-primary/5 p-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
          Mechanism
        </div>
        <MarkdownRenderer content={question.mechanisticExplanation} />
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex flex-wrap gap-2">
          {question.trapCategories.map((tag) => (
            <TrapBadge key={tag} tag={tag} />
          ))}
        </div>
        <div className="text-sm font-semibold">Distractor analysis</div>
        {question.choices
          .filter((choice) => choice.id !== question.correctAnswer)
          .map((choice) => (
            <details
              key={choice.id}
              className="rounded-md border bg-background px-4 py-3 open:border-amber-400/40"
              open={choice.id === selectedAnswer}
            >
              <summary className="cursor-pointer text-sm font-medium">
                {choice.id}. Why this answer is wrong
              </summary>
              <div className="mt-3 text-muted-foreground">
                <MarkdownRenderer
                  content={
                    question.distractorAnalysis[choice.id] ??
                    "No distractor analysis supplied for this choice."
                  }
                />
              </div>
            </details>
          ))}
      </div>
    </section>
  );
}

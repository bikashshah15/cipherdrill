"use client";

/* eslint-disable @next/next/no-img-element */

import { Check, X } from "lucide-react";
import { useState } from "react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { TrapBadge } from "@/components/trap-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SerializableQuestion } from "@/lib/types";

function DiagramSlot({ refId }: { refId: string }) {
  const [missing, setMissing] = useState(false);

  return (
    <div className="rounded-md border bg-muted/30 p-3">
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>Diagram</span>
        <code>{refId}</code>
      </div>
      {missing ? (
        <div className="flex min-h-44 items-center justify-center rounded-md border border-dashed text-center text-sm text-muted-foreground">
          Add an SVG or PNG at question-banks/diagrams/{refId}
        </div>
      ) : (
        <img
          src={`/api/diagram/${refId}`}
          alt={`Diagram ${refId}`}
          className="max-h-[360px] w-full rounded-md object-contain"
          onError={() => setMissing(true)}
        />
      )}
    </div>
  );
}

export function QuestionCard({
  question,
  selectedAnswer,
  submitted,
  onSelect,
  showLectureLabel = false
}: {
  question: SerializableQuestion;
  selectedAnswer: string | null;
  submitted: boolean;
  onSelect: (choiceId: string) => void;
  showLectureLabel?: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {showLectureLabel ? (
            <Badge variant="outline">{question.lectureTitle}</Badge>
          ) : null}
          <Badge variant="secondary">{question.type.replaceAll("_", " ")}</Badge>
          <Badge variant="outline">{question.difficulty}</Badge>
          <Badge variant="outline">{question.topic}</Badge>
          {question.gameRef ? <Badge variant="outline">game: {question.gameRef}</Badge> : null}
        </div>
        <div className="space-y-3">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {question.id}
          </div>
          <MarkdownRenderer content={question.stem} className="text-base" />
        </div>
        {question.diagramRef ? <DiagramSlot refId={question.diagramRef} /> : null}
        {question.trapCategories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {question.trapCategories.map((tag) => (
              <TrapBadge key={tag} tag={tag} />
            ))}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {question.choices.map((choice, index) => {
          const isSelected = selectedAnswer === choice.id;
          const isCorrect = question.correctAnswer === choice.id;
          const isWrongSelection = submitted && isSelected && !isCorrect;

          return (
            <button
              key={choice.id}
              type="button"
              onClick={() => {
                if (!submitted) {
                  onSelect(choice.id);
                }
              }}
              className={cn(
                "grid w-full grid-cols-[2.25rem_1fr_1.5rem] items-start gap-3 rounded-md border bg-background p-4 text-left transition-colors duration-150",
                "hover:border-primary/60 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected && !submitted ? "border-primary bg-primary/10" : "",
                submitted && isCorrect ? "border-emerald-500/70 bg-emerald-500/10" : "",
                isWrongSelection ? "border-rose-500/70 bg-rose-500/10" : ""
              )}
              aria-pressed={isSelected}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md border text-sm font-semibold">
                {choice.id}
              </span>
              <span className="min-w-0">
                <span className="mb-1 block text-xs text-muted-foreground">
                  Shortcut {index + 1} or {choice.id}
                </span>
                <MarkdownRenderer content={choice.text} />
              </span>
              <span className="flex h-6 items-center justify-center">
                {submitted && isCorrect ? (
                  <Check className="h-5 w-5 text-emerald-400" />
                ) : null}
                {isWrongSelection ? <X className="h-5 w-5 text-rose-400" /> : null}
              </span>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

"use client";

import { ArrowRight, CheckCircle2, HelpCircle, RotateCcw, XCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ExplanationPanel } from "@/components/explanation-panel";
import { ModeSelector, type PracticeFilters } from "@/components/mode-selector";
import { ProgressBar } from "@/components/progress-bar";
import { QuestionCard } from "@/components/question-card";
import { TrapBadge } from "@/components/trap-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { formatMs } from "@/lib/utils";
import type { SerializableQuestion } from "@/lib/types";

type PracticeMode = "practice" | "review" | "mixed";

type ResultLog = {
  question: SerializableQuestion;
  isCorrect: boolean;
  timeMs: number;
};

const defaultFilters: PracticeFilters = {
  types: [],
  difficulties: [],
  topic: "",
  diagramOnly: false,
  gameWalkOnly: false,
  length: 10
};

function shuffle<T>(items: T[]): T[] {
  return [...items]
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

function filterQuestions(
  questions: SerializableQuestion[],
  filters: PracticeFilters
): SerializableQuestion[] {
  const filtered = questions.filter((question) => {
    if (filters.types.length > 0 && !filters.types.includes(question.type)) {
      return false;
    }
    if (
      filters.difficulties.length > 0 &&
      !filters.difficulties.includes(question.difficulty)
    ) {
      return false;
    }
    if (filters.topic && question.topic !== filters.topic) {
      return false;
    }
    if (filters.diagramOnly && !question.diagramRef) {
      return false;
    }
    if (filters.gameWalkOnly && !question.gameRef) {
      return false;
    }
    return true;
  });

  if (filters.gameWalkOnly) {
    return filtered.sort(
      (a, b) =>
        (a.gameRef ?? "").localeCompare(b.gameRef ?? "") ||
        a.id.localeCompare(b.id)
    );
  }

  return shuffle(filtered);
}

function takeUnique(
  source: SerializableQuestion[],
  count: number,
  selected: Map<number, SerializableQuestion>
): void {
  for (const question of shuffle(source)) {
    if (selected.size >= count || selected.has(question.dbId)) {
      continue;
    }
    selected.set(question.dbId, question);
  }
}

function buildMixedQuestions(
  questions: SerializableQuestion[],
  length: 10 | 25 | 50,
  weakestTrapCategories: string[]
): SerializableQuestion[] {
  const target = Math.min(length, questions.length);
  const selected = new Map<number, SerializableQuestion>();
  const weakTrap = questions.filter((question) =>
    question.trapCategories.some((trap) => weakestTrapCategories.includes(trap))
  );
  const neverAttempted = questions.filter((question) => question.attempts === 0);
  const due = questions.filter((question) => question.dueForReview);

  takeUnique(weakTrap, Math.round(target * 0.4), selected);
  takeUnique(neverAttempted, Math.round(target * 0.7), selected);
  takeUnique(due, Math.round(target * 0.9), selected);
  takeUnique(questions, target, selected);

  return [...selected.values()].slice(0, target);
}

function postAttempt(payload: {
  questionId: number;
  selectedAnswer: string;
  timeSpentMs: number;
  sessionId: string;
  mode: PracticeMode;
}) {
  return fetch("/api/attempt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind: "answer", ...payload })
  });
}

function ShortcutOverlay() {
  const open = useAppStore((state) => state.shortcutsOpen);
  const setOpen = useAppStore((state) => state.setShortcutsOpen);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 p-4 backdrop-blur-sm">
      <div className="mx-auto mt-24 max-w-lg rounded-lg border bg-card p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Keyboard shortcuts</h2>
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
        <div className="grid grid-cols-[5rem_1fr] gap-3 text-sm">
          <kbd className="rounded border px-2 py-1 text-center">1-4</kbd>
          <span>Select answer by position</span>
          <kbd className="rounded border px-2 py-1 text-center">A-D</kbd>
          <span>Select answer by label</span>
          <kbd className="rounded border px-2 py-1 text-center">Enter</kbd>
          <span>Submit or advance</span>
          <kbd className="rounded border px-2 py-1 text-center">R</kbd>
          <span>Mark current question for review</span>
          <kbd className="rounded border px-2 py-1 text-center">?</kbd>
          <span>Open this overlay</span>
        </div>
      </div>
    </div>
  );
}

function summarize(results: ResultLog[]) {
  const wrong = results.filter((result) => !result.isCorrect);
  const trapCounts = new Map<string, number>();
  const topicCounts = new Map<string, number>();

  for (const result of wrong) {
    topicCounts.set(
      result.question.topic,
      (topicCounts.get(result.question.topic) ?? 0) + 1
    );
    for (const trap of result.question.trapCategories) {
      trapCounts.set(trap, (trapCounts.get(trap) ?? 0) + 1);
    }
  }

  return {
    weakestTrap: [...trapCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
    weakestTopic: [...topicCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  };
}

export function PracticeClient({
  title,
  lectureId,
  questions,
  mode,
  initialTopic = "",
  weakestTrapCategories = [],
  showLectureLabels = false
}: {
  title: string;
  lectureId?: string;
  questions: SerializableQuestion[];
  mode: PracticeMode;
  initialTopic?: string;
  weakestTrapCategories?: string[];
  showLectureLabels?: boolean;
}) {
  const [filters, setFilters] = useState<PracticeFilters>({
    ...defaultFilters,
    topic: initialTopic
  });
  const [sessionQuestions, setSessionQuestions] = useState<SerializableQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [questionStartedAt, setQuestionStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [results, setResults] = useState<ResultLog[]>([]);
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [apiError, setApiError] = useState<string | null>(null);
  const setShortcutsOpen = useAppStore((state) => state.setShortcutsOpen);

  const topics = useMemo(
    () => [...new Set(questions.map((question) => question.topic))].sort(),
    [questions]
  );

  const currentQuestion = sessionQuestions[currentIndex] ?? null;
  const finished = sessionQuestions.length > 0 && currentIndex >= sessionQuestions.length;
  const elapsedMs = startedAt ? now - startedAt : 0;

  useEffect(() => {
    if (!startedAt || finished) {
      return;
    }

    const interval = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(interval);
  }, [finished, startedAt]);

  function startSession() {
    const nextQuestions =
      mode === "mixed"
        ? buildMixedQuestions(questions, filters.length, weakestTrapCategories)
        : filterQuestions(questions, filters);

    setSessionQuestions(nextQuestions);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setSubmitted(false);
    setStartedAt(Date.now());
    setQuestionStartedAt(Date.now());
    setSessionId(crypto.randomUUID());
    setResults([]);
    setApiError(null);
  }

  function resetSession() {
    setSessionQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setSubmitted(false);
    setStartedAt(null);
    setQuestionStartedAt(null);
    setSessionId(null);
    setResults([]);
    setApiError(null);
  }

  const markForReview = useCallback(async () => {
    if (!currentQuestion) {
      return;
    }

    setMarked((prev) => new Set(prev).add(currentQuestion.dbId));
    await fetch("/api/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "mark", questionId: currentQuestion.dbId })
    }).catch(() => setApiError("Could not mark this question for review."));
  }, [currentQuestion]);

  const submitCurrent = useCallback(async () => {
    if (!currentQuestion || !selectedAnswer || submitted || !sessionId) {
      return;
    }

    const spent = questionStartedAt ? Date.now() - questionStartedAt : 0;
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setSubmitted(true);
    setResults((prev) => [
      ...prev,
      { question: currentQuestion, isCorrect, timeMs: spent }
    ]);

    const response = await postAttempt({
      questionId: currentQuestion.dbId,
      selectedAnswer,
      timeSpentMs: spent,
      sessionId,
      mode
    }).catch(() => null);

    if (!response?.ok) {
      setApiError("The answer was shown locally, but the attempt was not recorded.");
    }
  }, [
    currentQuestion,
    mode,
    questionStartedAt,
    selectedAnswer,
    sessionId,
    submitted
  ]);

  const advance = useCallback(() => {
    if (!submitted) {
      void submitCurrent();
      return;
    }

    setCurrentIndex((index) => index + 1);
    setSelectedAnswer(null);
    setSubmitted(false);
    setQuestionStartedAt(Date.now());
    setApiError(null);
  }, [submitted, submitCurrent]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "SELECT" ||
        target?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (event.key === "?") {
        event.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      if (!currentQuestion || finished) {
        return;
      }

      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        void markForReview();
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        advance();
        return;
      }

      if (!submitted) {
        const numeric = Number(event.key);
        if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 9) {
          const choice = currentQuestion.choices[numeric - 1];
          if (choice) {
            setSelectedAnswer(choice.id);
          }
        }

        const label = event.key.toUpperCase();
        if (currentQuestion.choices.some((choice) => choice.id === label)) {
          setSelectedAnswer(label);
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [advance, currentQuestion, finished, markForReview, setShortcutsOpen, submitted]);

  if (finished) {
    const correct = results.filter((result) => result.isCorrect).length;
    const summary = summarize(results);
    const totalTime = results.reduce((sum, result) => sum + result.timeMs, 0);

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Session summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div className="rounded-md border p-4">
              <div className="text-2xl font-semibold">{correct}/{results.length}</div>
              <div className="text-sm text-muted-foreground">correct</div>
            </div>
            <div className="rounded-md border p-4">
              <div className="text-2xl font-semibold">
                {results.length === 0 ? 0 : Math.round((correct / results.length) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">accuracy</div>
            </div>
            <div className="rounded-md border p-4">
              <div className="text-2xl font-semibold">{formatMs(totalTime)}</div>
              <div className="text-sm text-muted-foreground">answering time</div>
            </div>
            <div className="rounded-md border p-4">
              <div className="text-2xl font-semibold">{formatMs(elapsedMs)}</div>
              <div className="text-sm text-muted-foreground">session time</div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-5">
            <div className="mb-2 text-sm font-semibold">Weakest trap category</div>
            {summary.weakestTrap ? <TrapBadge tag={summary.weakestTrap} /> : <span className="text-sm text-muted-foreground">No misses recorded</span>}
          </div>
          <div className="rounded-lg border bg-card p-5">
            <div className="mb-2 text-sm font-semibold">Weakest topic</div>
            <div className="text-sm text-muted-foreground">
              {summary.weakestTopic ?? "No misses recorded"}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={resetSession} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            New session
          </Button>
          {lectureId ? (
            <Button asChild>
              <Link href={`/review/${lectureId}`}>Questions to review</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/analytics">Open analytics</Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (sessionQuestions.length === 0) {
    const filteredCount =
      mode === "mixed"
        ? Math.min(filters.length, questions.length)
        : filterQuestions(questions, filters).length;

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-medium uppercase text-primary">
              {mode === "review" ? "Review" : mode === "mixed" ? "Mixed mode" : "Practice"}
            </div>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              The session reveals mechanisms and distractor logic after each answer.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={() => setShortcutsOpen(true)}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Shortcuts
          </Button>
        </div>

        <ModeSelector
          filters={filters}
          topics={topics}
          mixed={mode === "mixed"}
          onChange={setFilters}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-5">
          <div>
            <div className="text-lg font-semibold">{filteredCount} questions ready</div>
            <div className="text-sm text-muted-foreground">
              {mode === "mixed"
                ? "Weighted 40% weak traps, 30% never attempted, 20% due review, 10% random."
                : "Game-walk mode keeps shared game references in sequence."}
            </div>
          </div>
          <Button type="button" onClick={startSession} disabled={filteredCount === 0}>
            Start
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <ShortcutOverlay />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ShortcutOverlay />
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">{title}</div>
            <div className="text-xs uppercase text-muted-foreground">
              {mode} session · {formatMs(elapsedMs)}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {submitted && selectedAnswer === currentQuestion?.correctAnswer ? (
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Correct
              </span>
            ) : null}
            {submitted && selectedAnswer !== currentQuestion?.correctAnswer ? (
              <span className="inline-flex items-center gap-1 text-rose-400">
                <XCircle className="h-4 w-4" /> Review mechanism
              </span>
            ) : null}
          </div>
        </div>
        <ProgressBar current={currentIndex + 1} total={sessionQuestions.length} />
      </div>

      {apiError ? (
        <div className="rounded-md border border-amber-400/50 bg-amber-400/10 p-3 text-sm text-amber-100">
          {apiError}
        </div>
      ) : null}

      {currentQuestion ? (
        <>
          <QuestionCard
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            submitted={submitted}
            onSelect={setSelectedAnswer}
            showLectureLabel={showLectureLabels}
          />
          <ExplanationPanel
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            visible={submitted}
          />
          <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 border bg-background/95 p-3 backdrop-blur">
            <Button
              type="button"
              variant={marked.has(currentQuestion.dbId) ? "secondary" : "outline"}
              onClick={() => void markForReview()}
            >
              Mark for review
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShortcutsOpen(true)}
                size="icon"
              >
                <HelpCircle className="h-4 w-4" />
                <span className="sr-only">Shortcuts</span>
              </Button>
              <Button
                type="button"
                onClick={advance}
                disabled={!selectedAnswer && !submitted}
              >
                {submitted
                  ? currentIndex === sessionQuestions.length - 1
                    ? "Finish"
                    : "Next question"
                  : "Submit"}
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

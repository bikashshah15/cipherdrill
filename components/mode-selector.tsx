"use client";

import { DIFFICULTIES, QUESTION_TYPES, type Difficulty, type QuestionType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PracticeFilters = {
  types: QuestionType[];
  difficulties: Difficulty[];
  topic: string;
  diagramOnly: boolean;
  gameWalkOnly: boolean;
  length: 10 | 25 | 50;
};

function toggleValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function ModeSelector({
  filters,
  topics,
  mixed,
  onChange
}: {
  filters: PracticeFilters;
  topics: string[];
  mixed?: boolean;
  onChange: (filters: PracticeFilters) => void;
}) {
  return (
    <div className="space-y-5 rounded-lg border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Session setup</h2>
          <p className="text-sm text-muted-foreground">
            Filters apply before the question order is built.
          </p>
        </div>
        {mixed ? (
          <div className="flex gap-2">
            {[10, 25, 50].map((length) => (
              <Button
                key={length}
                type="button"
                variant={filters.length === length ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  onChange({ ...filters, length: length as 10 | 25 | 50 })
                }
              >
                {length}
              </Button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase text-muted-foreground">
            Question type
          </div>
          <div className="flex flex-wrap gap-2">
            {QUESTION_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  onChange({ ...filters, types: toggleValue(filters.types, type) })
                }
                className={cn(
                  "rounded-md border px-2.5 py-1.5 text-xs transition-colors duration-150",
                  filters.types.includes(type)
                    ? "border-primary bg-primary/10 text-primary"
                    : "text-muted-foreground hover:border-primary/50"
                )}
              >
                {type.replaceAll("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase text-muted-foreground">
            Difficulty
          </div>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((difficulty) => (
              <button
                key={difficulty}
                type="button"
                onClick={() =>
                  onChange({
                    ...filters,
                    difficulties: toggleValue(filters.difficulties, difficulty)
                  })
                }
                className={cn(
                  "rounded-md border px-2.5 py-1.5 text-xs transition-colors duration-150",
                  filters.difficulties.includes(difficulty)
                    ? "border-primary bg-primary/10 text-primary"
                    : "text-muted-foreground hover:border-primary/50"
                )}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-end">
        <label className="space-y-2 text-sm">
          <span className="block text-xs font-semibold uppercase text-muted-foreground">
            Topic
          </span>
          <select
            value={filters.topic}
            onChange={(event) => onChange({ ...filters, topic: event.target.value })}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">All topics</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </label>

        <label className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm">
          <input
            type="checkbox"
            checked={filters.diagramOnly}
            onChange={(event) =>
              onChange({ ...filters, diagramOnly: event.target.checked })
            }
          />
          Diagram-only
        </label>

        <label className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm">
          <input
            type="checkbox"
            checked={filters.gameWalkOnly}
            onChange={(event) =>
              onChange({ ...filters, gameWalkOnly: event.target.checked })
            }
          />
          Game-walk
        </label>
      </div>
    </div>
  );
}

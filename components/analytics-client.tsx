"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DIFFICULTIES, type AnalyticsData } from "@/lib/types";
import { cn } from "@/lib/utils";

function ChartFrame({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-80">{children}</CardContent>
    </Card>
  );
}

function accuracyColor(value: number | null): string {
  if (value === null) {
    return "bg-muted text-muted-foreground";
  }
  if (value >= 80) {
    return "bg-emerald-500/20 text-emerald-200";
  }
  if (value >= 60) {
    return "bg-amber-500/20 text-amber-100";
  }
  return "bg-rose-500/20 text-rose-100";
}

export function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const topics = [...new Set(data.heatmap.map((cell) => cell.topic))];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-semibold">{data.readiness.score}%</div>
            <p className="mt-2 text-sm text-muted-foreground">
              {data.readiness.explanation}
            </p>
          </CardContent>
        </Card>
        {[
          ["Coverage", data.readiness.coverage],
          ["Accuracy", data.readiness.accuracy],
          ["Recency", data.readiness.recency]
        ].map(([label, value]) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-semibold">{value}%</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartFrame title="Accuracy over time">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.accuracyOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis dataKey="date" stroke="#a1a1aa" />
              <YAxis domain={[0, 100]} stroke="#a1a1aa" />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #3f3f46" }}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#22d3ee"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartFrame>

        <ChartFrame title="Accuracy by lecture">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.accuracyByLecture}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis dataKey="name" stroke="#a1a1aa" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} stroke="#a1a1aa" />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #3f3f46" }}
              />
              <Bar dataKey="accuracy" fill="#34d399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartFrame>

        <ChartFrame title="Accuracy by question type">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data.accuracyByType}>
              <PolarGrid stroke="#3f3f46" />
              <PolarAngleAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
              <Radar
                name="Accuracy"
                dataKey="accuracy"
                stroke="#fbbf24"
                fill="#fbbf24"
                fillOpacity={0.25}
              />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #3f3f46" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartFrame>

        <ChartFrame title="Accuracy by trap category">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.accuracyByTrapCategory}
              layout="vertical"
              margin={{ left: 110, right: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis type="number" domain={[0, 100]} stroke="#a1a1aa" />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#a1a1aa"
                tick={{ fontSize: 11 }}
                width={105}
              />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #3f3f46" }}
              />
              <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                {data.accuracyByTrapCategory.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.accuracy < 60 ? "#fb7185" : "#22d3ee"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartFrame>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Topic × difficulty heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[minmax(220px,1fr)_repeat(4,8rem)] gap-2 text-sm">
                <div className="text-muted-foreground">Topic</div>
                {DIFFICULTIES.map((difficulty) => (
                  <div key={difficulty} className="text-muted-foreground">
                    {difficulty}
                  </div>
                ))}
                {topics.map((topic) => (
                  <div key={topic} className="contents">
                    <div className="rounded-md border px-3 py-2 font-medium">{topic}</div>
                    {DIFFICULTIES.map((difficulty) => {
                      const cell = data.heatmap.find(
                        (item) =>
                          item.topic === topic && item.difficulty === difficulty
                      );
                      return (
                        <div
                          key={`${topic}-${difficulty}`}
                          className={cn(
                            "rounded-md border px-3 py-2 text-sm",
                            accuracyColor(cell?.accuracy ?? null)
                          )}
                        >
                          {cell?.accuracy === null || !cell
                            ? "No attempts"
                            : `${cell.accuracy}% (${cell.attempts})`}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

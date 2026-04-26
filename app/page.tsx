import { BarChart3, BookOpenText, Brain, Layers, Play, RefreshCw } from "lucide-react";
import Link from "next/link";
import { IngestButton } from "@/components/ingest-button";
import { TrapBadge } from "@/components/trap-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/lib/data";
import { formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatDate(value: string | null): string {
  if (!value) {
    return "No attempts";
  }
  return new Date(value).toLocaleDateString();
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium uppercase text-primary">Dashboard</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal">
            Mechanism-first exam drilling
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Practice modes prioritize why distractors fail, where definitions stop,
            and which security properties a mechanism actually provides.
          </p>
        </div>
        <IngestButton />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total questions</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {stats.totalQuestions}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total attempts</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {stats.totalAttempts}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Overall accuracy</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {formatPercent(stats.overallAccuracy)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Current streak</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {stats.currentStreak}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_22rem]">
        <div className="grid gap-4 md:grid-cols-2">
          {stats.lectures.map((lecture) => (
            <Card key={lecture.lectureId}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-medium uppercase text-muted-foreground">
                      Lecture {lecture.lectureNumber}
                    </div>
                    <CardTitle className="mt-1 leading-tight">{lecture.title}</CardTitle>
                  </div>
                  <Badge variant="outline">{lecture.questionCount} q</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {lecture.topics.slice(0, 5).map((topic) => (
                    <Badge key={topic} variant="secondary">
                      {topic}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-md border p-3">
                    <div className="font-semibold">{formatPercent(lecture.accuracy)}</div>
                    <div className="text-muted-foreground">accuracy</div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="font-semibold">{formatDate(lecture.lastAttemptedAt)}</div>
                    <div className="text-muted-foreground">last attempted</div>
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                    Weakest trap
                  </div>
                  {lecture.weakestTrapCategory ? (
                    <TrapBadge tag={lecture.weakestTrapCategory} />
                  ) : (
                    <span className="text-sm text-muted-foreground">No misses yet</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href={`/practice/${lecture.lectureId}`}>
                      <Play className="mr-2 h-4 w-4" />
                      Practice
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/review/${lecture.lectureId}`}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Review Wrong
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/concepts/${lecture.lectureId}`}>
                      <BookOpenText className="mr-2 h-4 w-4" />
                      Concept Primer
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mixed Mode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-cyan-300" />
                  40% weak trap categories
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-300" />
                  30% never attempted
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-amber-300" />
                  20% SRS due
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-rose-300" />
                  10% random
                </div>
              </div>
              <Button asChild className="w-full">
                <Link href="/practice/mixed">Start Mixed Mode</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Trap-category accuracy is the main weakness signal. Use it to find
                patterns in wrong answers, not just low lecture scores.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/analytics">Open analytics</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

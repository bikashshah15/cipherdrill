import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getConceptPrimer, getLectureQuestions } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ConceptPage({
  params
}: {
  params: { lectureId: string };
}) {
  const primer = getConceptPrimer(params.lectureId);
  const lecture = (await getLectureQuestions(params.lectureId)).lecture;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium uppercase text-primary">
            Concept primer
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal">
            {lecture?.title ?? params.lectureId}
          </h1>
        </div>

        {primer.content ? (
          <Card>
            <CardContent className="pt-6">
              <MarkdownRenderer content={primer.content} />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No primer found</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Add concept-primers/{params.lectureId}.md, then run `pnpm ingest` or
              use the dashboard Ingest button.
            </CardContent>
          </Card>
        )}
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Card>
          <CardHeader>
            <CardTitle>Quick jumps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {primer.headings.length === 0 ? (
              <div className="text-sm text-muted-foreground">No headings found.</div>
            ) : (
              primer.headings.map((heading) => (
                <Button
                  key={heading.id}
                  asChild
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left"
                >
                  <Link
                    href={`/practice/${params.lectureId}?topic=${encodeURIComponent(
                      heading.text
                    )}`}
                  >
                    {heading.text}
                  </Link>
                </Button>
              ))
            )}
          </CardContent>
        </Card>
      </aside>

      <Button asChild className="fixed bottom-6 right-6 shadow-lg">
        <Link href={`/practice/${params.lectureId}`}>
          I&apos;m ready
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

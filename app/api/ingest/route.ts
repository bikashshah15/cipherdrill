import { NextResponse } from "next/server";
import { z } from "zod";
import { ingestQuestionBanks } from "@/lib/ingest";

export const runtime = "nodejs";

const ingestRequestSchema = z.object({}).strict();

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as unknown;
  const parsed = ingestRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const summary = await ingestQuestionBanks(process.cwd());
  return NextResponse.json(summary, {
    status: summary.errors.length > 0 ? 400 : 200
  });
}

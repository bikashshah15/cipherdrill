import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const paramsSchema = z.object({
  ref: z.string().regex(/^[a-zA-Z0-9_-]+$/)
});

const contentTypes: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

export async function GET(
  _request: Request,
  context: { params: { ref: string } }
) {
  const parsed = paramsSchema.safeParse(context.params);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid diagram reference." }, { status: 400 });
  }

  const diagramDir = path.join(process.cwd(), "question-banks", "diagrams");
  for (const extension of Object.keys(contentTypes)) {
    const filePath = path.join(diagramDir, `${parsed.data.ref}${extension}`);
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      return new Response(new Uint8Array(buffer), {
        headers: {
          "Content-Type": contentTypes[extension],
          "Cache-Control": "no-store"
        }
      });
    }
  }

  return NextResponse.json({ error: "Diagram not found." }, { status: 404 });
}

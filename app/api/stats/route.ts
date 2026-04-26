import { NextResponse } from "next/server";
import { z } from "zod";
import { getAnalyticsData, getDashboardStats } from "@/lib/data";

export const runtime = "nodejs";

const querySchema = z.object({
  scope: z.enum(["dashboard", "analytics", "all"]).default("all")
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    scope: url.searchParams.get("scope") ?? "all"
  });

  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (parsed.data.scope === "dashboard") {
    return NextResponse.json({ dashboard: await getDashboardStats() });
  }

  if (parsed.data.scope === "analytics") {
    return NextResponse.json({ analytics: await getAnalyticsData() });
  }

  return NextResponse.json({
    dashboard: await getDashboardStats(),
    analytics: await getAnalyticsData()
  });
}

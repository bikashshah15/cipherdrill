import { AnalyticsClient } from "@/components/analytics-client";
import { getAnalyticsData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium uppercase text-primary">Analytics</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal">
          Trap-category weakness dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          This view weights the patterns behind wrong answers: definition
          boundaries, overclaims, oracle confusion, and mechanism errors.
        </p>
      </div>
      <AnalyticsClient data={await getAnalyticsData()} />
    </div>
  );
}

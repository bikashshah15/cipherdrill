"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { IngestSummary } from "@/lib/types";

export function IngestButton() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<IngestSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function ingest() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      const data = (await response.json()) as IngestSummary;
      setSummary(data);
      if (!response.ok && data.errors.length === 0) {
        setError("Ingestion failed.");
      }
    } catch {
      setError("Could not reach the ingestion endpoint.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button type="button" onClick={ingest} disabled={loading} variant="outline">
        <RefreshCw className="mr-2 h-4 w-4" />
        {loading ? "Ingesting" : "Ingest"}
      </Button>
      {summary ? (
        <div className="rounded-md border bg-card p-3 text-sm">
          <div className="font-medium">
            {summary.ingested} ingested · {summary.updated} updated ·{" "}
            {summary.primersLinked} primers linked
          </div>
          {summary.errors.length > 0 ? (
            <div className="mt-2 space-y-1 text-rose-300">
              {summary.errors.map((item) => (
                <div key={`${item.filePath}-${item.fieldPath}-${item.message}`}>
                  {item.filePath} {item.fieldPath}: {item.message}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-1 text-muted-foreground">No validation errors.</div>
          )}
        </div>
      ) : null}
      {error ? <div className="text-sm text-rose-300">{error}</div> : null}
    </div>
  );
}

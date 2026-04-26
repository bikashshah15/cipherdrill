import { ingestQuestionBanks } from "@/lib/ingest";

async function main(): Promise<void> {
  const quiet = process.argv.includes("--quiet");
  const summary = await ingestQuestionBanks(process.cwd());

  if (!quiet || summary.errors.length > 0) {
    console.log(JSON.stringify(summary, null, 2));
  }

  if (summary.errors.length > 0) {
    process.exitCode = 1;
  }
}

void main();

import { ingestQuestionBanks } from "@/lib/ingest";

async function test() {
  console.log("Starting ingest test...");
  const summary = await ingestQuestionBanks(process.cwd());
  console.log("Ingest summary:");
  console.log(`  Ingested: ${summary.ingested}`);
  console.log(`  Updated: ${summary.updated}`);
  console.log(`  Primers linked: ${summary.primersLinked}`);
  console.log(`  Errors: ${summary.errors.length}`);
  
  if (summary.errors.length > 0) {
    console.log("\nErrors:");
    summary.errors.forEach((error) => {
      console.log(`  ${error.filePath}: ${error.message}`);
    });
  }
  
  // Check database
  const { getDb } = await import("@/lib/db");
  const db = await getDb();
  const { schema } = await import("@/lib/db");
  const lectureCount = await db
    .select()
    .from(schema.lectures)
    .all();
  const questionCount = await db
    .select()
    .from(schema.questions)
    .all();
  
  console.log(`\nDatabase state:`);
  console.log(`  Lectures: ${lectureCount.length}`);
  console.log(`  Questions: ${questionCount.length}`);
}

test().catch(console.error);

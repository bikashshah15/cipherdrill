import { env } from "@/lib/env";
import type { CipherDrillDb } from "./types";

export * as schema from "./schema";
export type { CipherDrillDb } from "./types";

async function createDb(): Promise<CipherDrillDb> {
  if (env.DB_DRIVER === "turso") {
    const { createTursoDb } = await import("./client.turso");
    return createTursoDb() as unknown as CipherDrillDb;
  }

  const { createLocalDb } = await import("./client.local");
  return createLocalDb();
}

let instance: CipherDrillDb | null = null;

export async function getDb(): Promise<CipherDrillDb> {
  if (!instance) {
    instance = await createDb();
  }

  return instance;
}

// Synchronous convenience export. It is only defined after initDb() has run.
export let db: CipherDrillDb;

export async function initDb(): Promise<CipherDrillDb> {
  db = await getDb();
  return db;
}

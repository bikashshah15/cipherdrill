import type { createLocalDb } from "./client.local";

export type LocalDb = ReturnType<typeof createLocalDb>;
export type CipherDrillDb = LocalDb;

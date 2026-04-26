import type { Config } from "drizzle-kit";

const isTurso = process.env.DB_DRIVER === "turso";

export default {
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: isTurso ? "turso" : "sqlite",
  dbCredentials: isTurso
    ? {
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN
      }
    : {
        url: process.env.LOCAL_DB_PATH ?? "./cipherdrill.db"
      }
} satisfies Config;

import { z } from "zod";

const envSchema = z
  .object({
    DB_DRIVER: z.enum(["local", "turso"]).default("local"),
    LOCAL_DB_PATH: z.string().optional(),
    TURSO_DATABASE_URL: z.string().url().optional(),
    TURSO_AUTH_TOKEN: z.string().optional()
  })
  .superRefine((value, ctx) => {
    if (value.DB_DRIVER === "turso" && !value.TURSO_DATABASE_URL) {
      ctx.addIssue({
        code: "custom",
        message: "TURSO_DATABASE_URL required when DB_DRIVER=turso",
        path: ["TURSO_DATABASE_URL"]
      });
    }
  });

export const env = envSchema.parse(process.env);

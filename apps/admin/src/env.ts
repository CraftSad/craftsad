import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets-zod";
import { z } from "zod";

export const env = createEnv({
  extends: [vercel()],
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  /**
   * Admin panel env. Everything it needs from the base schema (ADMIN_URL,
   * AUTH_SECRET, POSTGRES_URL, …) is validated by `@acme/config`.
   */
  server: {
    PORT: z.coerce.number().default(3001),
  },
  client: {
    /**
     * Optional override for the oRPC origin. Unset keeps requests on the
     * current origin and lets the built-in `/api/orpc` route handler serve
     * them.
     */
    NEXT_PUBLIC_ADMIN_API_URL: z.string().url().optional(),
  },
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_ADMIN_API_URL: process.env.NEXT_PUBLIC_ADMIN_API_URL,
  },
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});

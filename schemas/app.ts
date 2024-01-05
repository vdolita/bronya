import { z } from "zod";

const MAX_APP_NAME_LEN = 12;

export const appName = z
  .string()
  .min(1)
  .max(MAX_APP_NAME_LEN)
  .regex(/^[a-zA-Z][a-zA-Z0-9_]+$/);

export type AppName = z.infer<typeof appName>;

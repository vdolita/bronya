import { z } from "zod"

export const username = z
  .string()
  .min(1)
  .max(16)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9-_]+$/)
export type Username = z.infer<typeof username>

export const password = z.string().min(6).max(32)
export type Password = z.infer<typeof password>

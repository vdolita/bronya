import { z } from "zod"

export const sessionSchema = z.object({
  token: z.string(),
  username: z.string(),
  expireAt: z.date(),
})
export type Session = z.infer<typeof sessionSchema>

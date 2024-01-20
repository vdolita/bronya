import { z } from "zod"
import { userSchema } from "."
import { pageOffset } from "../meta"

export const getUsersRes = z.object({
  success: z.boolean(),
  data: z.array(
    userSchema.omit({ password: true }).extend({ password: z.string() })
  ),
  lastOffset: pageOffset.optional(),
})

import { z } from "zod"

export const getAppRes = z.object({
  success: z.boolean(),
  data: z.array(z.string()),
})

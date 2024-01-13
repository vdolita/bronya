import { z } from "zod"
import { appSchema } from "./app"

export const getAppRes = z.object({
  success: z.boolean(),
  data: z.array(appSchema),
})

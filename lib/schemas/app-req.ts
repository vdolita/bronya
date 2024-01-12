import { z } from "zod"
import { appName } from "../meta"

export const createAppReq = z.object({
  name: appName,
})

export type CreateAppReq = z.infer<typeof createAppReq>

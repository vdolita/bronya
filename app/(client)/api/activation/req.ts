import { actRecordSchema } from "@/lib/schemas"
import { z } from "zod"

export const activationReq = actRecordSchema.pick({
  app: true,
  key: true,
  identityCode: true,
})
export type ActivationReq = z.infer<typeof activationReq>

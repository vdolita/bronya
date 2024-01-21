import { actRecordSchema } from "@/lib/schemas"

export const arSyncReq = actRecordSchema.pick({
  app: true,
  key: true,
  identityCode: true,
  rollingCode: true,
})

import { actRecordSchema } from "@/lib/schemas"

export const arAckReq = actRecordSchema.pick({
  app: true,
  key: true,
  identityCode: true,
  rollingCode: true,
})

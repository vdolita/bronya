import { actRecordSchema } from "@/lib/schemas"
import { atLeastOne } from "@/lib/utils/zod"
import { z } from "zod"

export const updateArData = actRecordSchema
  .pick({
    key: true,
    identityCode: true,
    status: true,
    remark: true,
    labels: true,
    expireAt: true,
  })
  .partial({ status: true, remark: true, labels: true, expireAt: true })
  .refine(...atLeastOne(["status", "remark", "labels", "expireAt"]))
export type UpdateArData = z.infer<typeof updateArData>

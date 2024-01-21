import { licenseSchema } from "@/lib/schemas"
import { atLeastOne } from "@/lib/utils/zod"
import { z } from "zod"

const MAX_GENERATE_LICENSES = 10000 // max generate 10000 licenses at once
export const createLcsData = licenseSchema
  .pick({
    app: true,
    validFrom: true,
    duration: true,
    totalActCount: true,
    rollingDays: true,
    labels: true,
  })
  .extend({
    quantity: z.coerce.number().int().min(1).max(MAX_GENERATE_LICENSES),
  })
export type CreateLcsData = z.infer<typeof createLcsData>

export const updateLcsData = licenseSchema
  .pick({
    key: true,
    status: true,
    remark: true,
    labels: true,
  })
  .partial({
    status: true,
    remark: true,
    labels: true,
  })
  .refine(...atLeastOne(["status", "remark", "labels"]))
export type UpdateLcsData = z.infer<typeof updateLcsData>

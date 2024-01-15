import {
  appName,
  identityCode,
  labels,
  licenseKey,
  remark,
  rollingCode,
  rollingDays,
  statusEnum,
} from "@/lib/meta"
import { z } from "zod"

export const actRecordSchema = z.object({
  key: licenseKey,
  app: appName,
  identityCode: identityCode,
  rollingCode: rollingCode,
  nxRollingCode: rollingCode.optional(),
  activatedAt: z.coerce.date(),
  expireAt: z.coerce.date(),
  status: statusEnum,
  remark: remark,
  labels: labels,
  lastRollingAt: z.coerce.date().optional(),
  rollingDays: rollingDays,
})
export type ActivationRecord = z.infer<typeof actRecordSchema>

export const arSyncResult = actRecordSchema
  .pick({
    status: true,
    expireAt: true,
    nxRollingCode: true,
  })
  .partial()
  .required({ status: true })
  .extend({
    appVersion: z.string(),
  })
export type ArSyncResult = z.infer<typeof arSyncResult>

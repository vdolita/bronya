import {
  appName,
  arStatus,
  identityCode,
  labels,
  licenseKey,
  remark,
  rollingCode,
  rollingDays,
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
  status: arStatus,
  remark: remark,
  labels: labels,
  lastRollingAt: z.coerce.date().optional(),
  rollingDays: rollingDays,
})
export type ActivationRecord = z.infer<typeof actRecordSchema>

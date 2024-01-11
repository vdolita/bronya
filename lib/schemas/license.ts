import { statusEnum } from "@/lib/meta"
import z from "zod"
import { appName } from "./app"

const MAX_REMARKS_LEN = 120
const MAX_LABEL_STR_LEN = 16
const MAX_DURATION = 3650 * 5 // max 5 years
const MAX_ROLLING_DAYS = 365 // max 1 year

export const MAX_LCS_LABELS = 5 // max 5 labels per license
export const MAX_ACT_TIMES = 200 // max 200 activation times per license

export const licenseKey = z.string().uuid()
export type LicenseKey = z.infer<typeof licenseKey>

export const remarks = z.string().min(0).max(MAX_REMARKS_LEN)
export type Remarks = z.infer<typeof remarks>

export const licenseLabel = z
  .string()
  .min(1)
  .max(MAX_LABEL_STR_LEN)
  .regex(/[a-zA-Z0-9]+$/)
export type LicenseLabel = z.infer<typeof licenseLabel>

export const labels = z.array(licenseLabel).max(MAX_LCS_LABELS)
export type Label = z.infer<typeof labels>

// duration in days
export const licenseDuration = z.coerce.number().int().min(1).max(MAX_DURATION)
export type LicenseDuration = z.infer<typeof licenseDuration>

// total available activation count
export const totalActCount = z.coerce.number().int().min(1).max(MAX_ACT_TIMES)
export type TotalActCount = z.infer<typeof totalActCount>

export const rollingDays = z.coerce.number().int().min(0).max(MAX_ROLLING_DAYS)
export type RollingDays = z.infer<typeof rollingDays>

export const licenseSchema = z.object({
  key: licenseKey,
  app: appName,
  createdAt: z.coerce.date(),
  validFrom: z.coerce.date(),
  duration: licenseDuration,
  status: statusEnum,
  totalActCount: totalActCount,
  balanceActCount: z.number().int().min(0),
  remarks: remarks.default(""),
  labels: labels,
  rollingDays: rollingDays.default(0),
})

export type License = z.infer<typeof licenseSchema>

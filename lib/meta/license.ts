import { z } from "zod"

// Dynamodb entity prefix

/** Dynamodb license item prefix */
export const LICENSE_P = "lcs"

const MAX_REMARK_LEN = 120
const MAX_LABEL_STR_LEN = 16
const MAX_DURATION = 365 * 100 // max 100 years
const MAX_ROLLING_DAYS = 365 * 100 // max 1 year

export const MAX_LCS_LABELS = 5 // max 5 labels per license
export const MAX_ACT_TIMES = 200 // max 200 activation times per license

export const licenseKey = z.string().uuid()
export type LicenseKey = z.infer<typeof licenseKey>

export const remark = z.string().min(0).max(MAX_REMARK_LEN)
export type Remark = z.infer<typeof remark>

export const licenseLabel = z.string().min(1).max(MAX_LABEL_STR_LEN)
export type LicenseLabel = z.infer<typeof licenseLabel>

export const labels = z.array(licenseLabel).max(MAX_LCS_LABELS)
export type Labels = z.infer<typeof labels>

// duration in days
export const licenseDuration = z.coerce.number().int().min(1).max(MAX_DURATION)
export type LicenseDuration = z.infer<typeof licenseDuration>

// total available activation count
export const totalActCount = z.coerce.number().int().min(1).max(MAX_ACT_TIMES)
export type TotalActCount = z.infer<typeof totalActCount>

export const rollingDays = z.coerce.number().int().min(0).max(MAX_ROLLING_DAYS)
export type RollingDays = z.infer<typeof rollingDays>

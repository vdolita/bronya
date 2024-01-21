import {
  appName,
  labels,
  lcsStatus,
  licenseDuration,
  licenseKey,
  remark,
  rollingDays,
  totalActCount,
} from "@/lib/meta"
import z from "zod"

export const licenseSchema = z.object({
  key: licenseKey,
  app: appName,
  createdAt: z.coerce.date(),
  validFrom: z.coerce.date(),
  duration: licenseDuration,
  status: lcsStatus,
  totalActCount: totalActCount,
  balanceActCount: z.number().int().min(0),
  remark: remark.default(""),
  labels: labels,
  rollingDays: rollingDays,
})

export type License = z.infer<typeof licenseSchema>

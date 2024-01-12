import {
  appName,
  labels,
  licenseDuration,
  licenseKey,
  remark,
  rollingDays,
  statusEnum,
  totalActCount,
} from "@/lib/meta"
import z from "zod"

export const licenseSchema = z.object({
  key: licenseKey,
  app: appName,
  createdAt: z.coerce.date(),
  validFrom: z.coerce.date(),
  duration: licenseDuration,
  status: statusEnum,
  totalActCount: totalActCount,
  balanceActCount: z.number().int().min(0),
  remark: remark.default(""),
  labels: labels,
  rollingDays: rollingDays.default(0),
})

export type License = z.infer<typeof licenseSchema>

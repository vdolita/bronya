import { appName, lcsArEnum } from "@/lib/meta"
import { z } from "zod"

export const exportReq = z.object({
  app: appName,
  type: lcsArEnum,
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
})
export type ExportReq = z.infer<typeof exportReq>

import { z } from "zod"
import { appName } from "../meta"

export const exportReq = z.object({
  app: appName,
  type: z.enum(["lcs", "ar"]),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
})
export type ExportReq = z.infer<typeof exportReq>

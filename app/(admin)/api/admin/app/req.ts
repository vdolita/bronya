import { lcsArEnum } from "@/lib/meta"
import { z } from "zod"

export const getAppListReq = z.object({
  type: lcsArEnum.optional(),
})
export type GetAppListReq = z.infer<typeof getAppListReq>

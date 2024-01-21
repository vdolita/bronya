import { appSchema } from "@/lib/schemas/app"
import { z } from "zod"

export const createAppData = appSchema.pick({
  name: true,
  version: true,
  encryptType: true,
})
export type CreateAppData = z.infer<typeof createAppData>

export const updateAppData = appSchema.pick({ name: true, version: true })
export type UpdateAppData = z.infer<typeof updateAppData>

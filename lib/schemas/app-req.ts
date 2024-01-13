import { z } from "zod"
import { appSchema } from "./app"

export const createAppReq = appSchema.omit({
  publicKey: true,
  privateKey: true,
})
export type CreateAppReq = z.infer<typeof createAppReq>

import { z } from "zod"
import { appEncryptType, appName, appVersion } from "../meta"

export const appSchema = z.object({
  name: appName,
  version: appVersion,
  encryptType: appEncryptType,
  privateKey: z.string(),
  publicKey: z.string(),
})
export type ClientApp = z.infer<typeof appSchema>

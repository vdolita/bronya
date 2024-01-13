import { z } from "zod"
import { appEncryptMode, appName, appVersion } from "../meta"

export const appSchema = z.object({
  name: appName,
  version: appVersion,
  encryptMode: appEncryptMode,
  privateKey: z.string(),
  publicKey: z.string(),
})
export type ClientApp = z.infer<typeof appSchema>

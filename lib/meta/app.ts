import { z } from "zod"

const MAX_APP_NAME_LEN = 12

export const APP_ENCRYPT_NONE = "NONE"
export const APP_ENCRYPT_JWS = "JWS" // RSA

export const appName = z
  .string()
  .min(1)
  .max(MAX_APP_NAME_LEN)
  .regex(/^[a-zA-Z0-9]+$/)

export type AppName = z.infer<typeof appName>

export const appVersion = z.string().min(1).max(512)
export type AppVersion = z.infer<typeof appVersion>

export const appEncryptType = z.enum([APP_ENCRYPT_NONE, APP_ENCRYPT_JWS])
export type AppEncryptType = z.infer<typeof appEncryptType>

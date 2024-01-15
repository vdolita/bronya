import { z } from "zod"

/** Dynamodb activation record item prefix */
export const ACTIVATION_RECORD_P = "ar"
/** Dynamodb activation record item sk prefix */
export const ACTIVATION_RECORD_S = "idc"

export const ROLLING_CODE_LENGTH = 8

// client identity code, if your license can only use once, can set to a const in client, otherwise should be unique. i.e. machine code
export const identityCode = z
  .string()
  .min(1)
  .max(120)
  .regex(/[a-zA-Z0-9][a-zA-Z0-9-_]+$/)
export type IdentityCode = z.infer<typeof identityCode>

// rolling Code, rotate in days or consistent
export const rollingCode = z.string().length(ROLLING_CODE_LENGTH)
export type RollingCode = z.infer<typeof rollingCode>

import { z } from "zod"

export const ROLLING_CODE_LENGTH = 8

// client identity code, if your license can only use once, can set to a const in client, otherwise should be unique. i.e. machine code
export const identityCode = z.string().min(1).max(120)
export type IdentityCode = z.infer<typeof identityCode>

// rolling Code, rotate in days or consistent
export const rollingCode = z.string().length(ROLLING_CODE_LENGTH)
export type RollingCode = z.infer<typeof rollingCode>

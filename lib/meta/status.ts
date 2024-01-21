import { z } from "zod"

export const STATUS_ACT_WAIT = "active_wait"
export const STATUS_ACT = "active"
export const STATUS_DISABLED = "disabled"
export const STATUS_EXPIRED = "expired"
export const STATUS_INVALID = "invalid"

export const statusEnum = z.enum([
  STATUS_ACT_WAIT,
  STATUS_ACT,
  STATUS_DISABLED,
  STATUS_EXPIRED,
  STATUS_INVALID,
])

export type StatusEnum = z.infer<typeof statusEnum>

export const lcsStatus = z.enum([STATUS_ACT, STATUS_DISABLED])
export type LcsStatus = z.infer<typeof lcsStatus>

export const arStatus = z.enum([STATUS_ACT, STATUS_ACT_WAIT, STATUS_DISABLED])
export type ArStatus = z.infer<typeof arStatus>

export const userStatus = z.enum([STATUS_ACT, STATUS_DISABLED])
export type UserStatus = z.infer<typeof userStatus>

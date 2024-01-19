import { z } from "zod"

export const adminPerm = "admin"

const permRscArr = ["user", "app", "lcs", "ar"] as const
const permActArr = ["r", "w", "c"] as const
const permArr = [
  adminPerm,
  "user:r",
  "user:w",
  "user:c",
  "app:r",
  "app:w",
  "app:c",
  "lcs:r",
  "lcs:w",
  "lcs:c",
  "ar:r",
  "ar:w",
  "ar:c",
] as const

/** user, app, license, activation record */
export const permRsc = z.enum(permRscArr)
/** read write create */
export const permAct = z.enum(permActArr)

export const perm = z.enum(permArr)
export type Perm = z.infer<typeof perm>

export const permObj = z.object({
  rsc: permRsc,
  act: permAct,
})
export type PermObj = z.infer<typeof permObj>

export const userPerms = z.array(perm)
export type UserPerms = z.infer<typeof userPerms>

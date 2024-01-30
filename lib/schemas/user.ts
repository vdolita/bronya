import { z } from "zod"
import { password, userStatus, username } from "../meta"
import { userPerms } from "../permit/permission"

export const userSchema = z.object({
  username: username,
  password: password,
  status: userStatus,
  perms: userPerms,
})
export type User = z.infer<typeof userSchema>

import { z } from "zod"
import { password, username } from "../meta"

export const userSchema = z.object({
  username: username,
  password: password,
})
export type User = z.infer<typeof userSchema>

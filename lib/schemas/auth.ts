import { z } from "zod"
import { password, username } from "../meta"

export const authCredential = z.object({
  username: username,
  password: password,
})

export type AuthCredential = z.infer<typeof authCredential>

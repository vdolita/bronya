import { userSchema } from "@/lib/schemas"
import { z } from "zod"

export const createUserData = userSchema.omit({ status: true })
export type CreateUserData = z.infer<typeof createUserData>

export const createAdminData = userSchema.pick({
  username: true,
  password: true,
})
export type CreateAdminData = z.infer<typeof createAdminData>

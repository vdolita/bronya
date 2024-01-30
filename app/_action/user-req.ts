import { password } from "@/lib/meta"
import { userSchema } from "@/lib/schemas"
import { atLeastOne } from "@/lib/utils/zod"
import { z } from "zod"

export const createUserData = userSchema
  .omit({ status: true })
  .required({ perms: true })
export type CreateUserData = z.infer<typeof createUserData>

export const createAdminData = userSchema.pick({
  username: true,
  password: true,
})
export type CreateAdminData = z.infer<typeof createAdminData>

export const updateUserData = userSchema
  .omit({ password: true })
  .extend({
    password: password
      .or(z.string().length(0))
      .transform((v) => (!v ? undefined : v)),
  })
  .partial({ password: true, status: true, perms: true })
  .refine(...atLeastOne(["password", "status", "perms"]))
export type UpdateUserData = z.infer<typeof updateUserData>

import { z } from "zod"
import { pageOffset } from "../meta"
import { userSchema } from "./user"

export const createAdminUserReq = userSchema.pick({
  username: true,
  password: true,
})

export type CreateAdminUserReq = typeof createAdminUserReq

export const getUsersReq = z.object({
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  offset: pageOffset.optional(),
})
export type GetUsersReq = z.infer<typeof getUsersReq>

export const createUserReq = userSchema.omit({ status: true })
export type CreateUserReq = z.infer<typeof createUserReq>

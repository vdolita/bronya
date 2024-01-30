import { pager, username } from "@/lib/meta"
import { z } from "zod"

export const getUsersReq = z
  .object({
    username: username.optional(),
  })
  .merge(pager)

export type GetUsersReq = z.infer<typeof getUsersReq>

import { pageOffset } from "@/lib/meta"
import { userSchema } from "@/lib/schemas"
import { z } from "zod"

export const getUsersRes = z.object({
  success: z.boolean(),
  data: z.array(
    userSchema.omit({ password: true }).extend({ password: z.string() })
  ),
  lastOffset: pageOffset.optional(),
})

export async function fetchUser(url: string) {
  const response = await fetch(url)
  const res: unknown = await response.json()
  const safeData = getUsersRes.safeParse(res)

  if (!safeData.success || !safeData.data.success) {
    throw new Error("fetch users failed")
  }

  const { lastOffset, data: users } = safeData.data
  return { users: users, lastOffset: lastOffset }
}

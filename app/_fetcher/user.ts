import { getUsersRes } from "@/lib/schemas/user-res"

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

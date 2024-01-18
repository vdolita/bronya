"use server"

import { createAdminUser } from "@/lib/biz/user"
import { User, userSchema } from "@/lib/schemas"
import { BadRequestError } from "@/lib/utils/error"

export async function createAdminUserAction(
  user: User
): Promise<{ success: boolean; error?: string }> {
  const safeData = userSchema.safeParse(user)
  if (!safeData.success) {
    const formatted = safeData.error.format()
    const err =
      formatted.username?._errors[0] ||
      formatted.password?._errors[0] ||
      "Invalid user"
    return { success: false, error: err }
  }

  const { username, password } = safeData.data

  try {
    await createAdminUser(username, password)
  } catch (err) {
    if (err instanceof BadRequestError) {
      return { success: false, error: err.message }
    }
    return { success: false, error: "Failed to create user" }
  }

  return { success: true }
}

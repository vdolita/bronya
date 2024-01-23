import bcrypt from "bcrypt"
import getQueryAdapter from "../query"
import { authCredential } from "../schemas"
import { User } from "../schemas/user"

export async function authenticate(
  username: string,
  password: string,
): Promise<{ user?: User; error?: string }> {
  const q = getQueryAdapter().user
  const user = await q.find(username)

  if (!user) {
    return { error: "Invalid username" }
  }

  const hash = user.password
  const match = await bcrypt.compare(password, hash)

  if (!match) {
    return { error: "Invalid password" }
  }

  return { user }
}

export async function nextAuth(
  credentials: Record<"username" | "password", string> | undefined,
): Promise<{ id: string; name: string } | null> {
  const safeData = authCredential.safeParse(credentials)

  if (!safeData.success) {
    return null
  }

  const { username, password } = safeData.data
  const { user, error } = await authenticate(username, password)

  if (error) {
    return null
  }

  return { id: user!.username, name: user!.username }
}

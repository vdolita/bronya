import getQueryAdapter from "@/lib/query"
import { cookies, headers } from "next/headers"

export async function isAuthenticated() {
  if (process.env.NODE_ENV === "development") {
    return true
  }

  const cookieStore = cookies()
  const token = cookieStore.get("ssid")?.value || headers().get("authorization")
  if (!token) {
    return false
  }

  const q = getQueryAdapter()
  const s = await q.findSession(token)
  if (!s) {
    return false
  }

  // TODO: extend session ttl

  return true
}

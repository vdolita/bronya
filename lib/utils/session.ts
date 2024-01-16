import getQueryAdapter from "@/lib/query"
import crypto from "crypto"

const DEFAULT_SESSION_TTL = 60 * 60 * 2 // 2 hours

export const newSession = async (username: string) => {
  const q = getQueryAdapter()

  const ssid = generateSessionID()
  const ttl = Number(process.env.SESSION_TTL) || DEFAULT_SESSION_TTL
  const expires = new Date(Date.now() + ttl * 1000)
  await q.createSession(ssid, username, expires)
  return ssid
}

function generateSessionID() {
  // generate a random string with hex characters
  const buffer = crypto.randomBytes(32)
  return buffer.toString("hex")
}

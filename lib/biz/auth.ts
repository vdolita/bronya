import bcrypt from "bcrypt"
import getQueryAdapter from "../query"
import { Session } from "../schemas/session"
import { User } from "../schemas/user"
import { BadRequestError } from "../utils/error"
import { randomStrSync } from "../utils/random"

const DEFAULT_SESSION_TTL = 60 * 60 * 2 // 2 hours

export async function authenticate(
  username: string,
  password: string
): Promise<Session> {
  const user = await mustGetUser(username, password)
  const s = await newSession(user.username)
  return s
}

async function mustGetUser(username: string, pwd: string): Promise<User> {
  const q = getQueryAdapter().user
  const user = await q.find(username)

  if (!user) {
    throw new BadRequestError("User not found")
  }

  const hash = user.password
  const match = await bcrypt.compare(pwd, hash)

  if (!match) {
    throw new BadRequestError("Invalid password")
  }

  return user
}

async function newSession(username: string): Promise<Session> {
  const q = getQueryAdapter().session

  const ssid = randomStrSync(32)
  const ttl = Number(process.env.SESSION_TTL) || DEFAULT_SESSION_TTL
  const exp = new Date(Date.now() + ttl * 1000)

  return await q.create(ssid, username, exp)
}

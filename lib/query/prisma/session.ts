import { Session } from "@/lib/schemas"
import { ISessionQuery } from "../adapter"
import { getPrismaClient } from "./prisma"

async function addSession(
  ssid: string,
  username: string,
  expire: Date
): Promise<Session> {
  const pc = getPrismaClient()

  // delete all expired session and old session
  await pc.session.deleteMany({
    where: {
      OR: [{ expiredAt: { lte: new Date() } }, { user: { name: username } }],
    },
  })

  const s = await pc.user.update({
    where: { name: username },
    data: { session: { create: { token: ssid, expiredAt: expire } } },
  })

  return {
    username: s.name,
    token: ssid,
    expireAt: expire,
  }
}

async function getSession(ssid: string): Promise<Session | null> {
  const pc = getPrismaClient()

  const session = await pc.session.findUnique({
    where: { token: ssid },
    include: { user: { select: { name: true } } },
  })

  if (!session) {
    return null
  }

  return {
    token: session.token,
    username: session.user.name,
    expireAt: session.expiredAt,
  }
}

const sessionQuery: ISessionQuery = {
  create: addSession,
  find: getSession,
}

export default sessionQuery

import { NotFoundError } from "@/lib/utils/error"
import { getPrismaClient } from "./prisma"

export async function addSession(ssid: string, username: string, ttl: Date) {
  const pc = getPrismaClient()
  const user = await pc.user.findUnique({
    where: { name: username },
    select: { id: true },
  })
  if (!user) {
    throw new NotFoundError("user not found")
  }

  await pc.session.create({
    data: {
      userId: user.id,
      token: ssid,
      expiredAt: ttl,
    },
  })
}

export async function getSession(ssid: string) {
  const pc = getPrismaClient()
  const session = await pc.session.findUnique({
    where: { token: ssid },
    include: { user: { select: { name: true } } },
  })
  if (!session) {
    return null
  }

  return {
    username: session.user.name,
  }
}

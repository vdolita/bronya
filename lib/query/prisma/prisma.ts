import { Pager } from "@/lib/meta"
import { Prisma, PrismaClient } from "@prisma/client"
import { z } from "zod"

let prisma: PrismaClient

declare global {
  // eslint-disable-next-line no-var
  var bronyaPrisma: undefined | PrismaClient
}

export function getPrismaClient(): PrismaClient {
  const log: (Prisma.LogLevel | Prisma.LogDefinition)[] = ["warn", "error"]

  if (process.env.NODE_ENV === "development") {
    log.push("query", "info")
    if (!globalThis.bronyaPrisma) {
      globalThis.bronyaPrisma = new PrismaClient({ log })
    }

    return globalThis.bronyaPrisma
  }

  if (!prisma) {
    prisma = new PrismaClient()
  }

  return prisma
}

export function toPrismaPager(p: Pager) {
  const safeOffset = z.coerce.number().int().min(0).safeParse(p.offset)
  const take = p.pageSize
  const skip = safeOffset.success ? safeOffset.data : 0
  return { take, skip }
}

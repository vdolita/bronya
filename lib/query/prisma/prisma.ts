import { Pager } from "@/lib/meta"
import { Prisma, PrismaClient } from "@prisma/client"
import { z } from "zod"

let prisma: PrismaClient

export function getPrismaClient(): PrismaClient {
  const log: (Prisma.LogLevel | Prisma.LogDefinition)[] = ["warn", "error"]

  if (process.env.NODE_ENV === "development") {
    log.push("query", "info")
  }

  if (!prisma) {
    prisma = new PrismaClient({
      log,
    })
  }

  return prisma
}

export function toPrismaPager(p: Pager) {
  const safeOffset = z.coerce.number().int().min(0).safeParse(p.offset)
  const take = p.pageSize
  const skip = safeOffset.success ? safeOffset.data : 0
  return { take, skip }
}

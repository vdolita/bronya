import { Pager } from "@/lib/meta"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

let prisma: PrismaClient

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient()
  }

  return prisma
}

export function toPrismaPager(p: Pager) {
  const safeOffset = z.coerce.number().int().min(0).safeParse(p.offset)
  const take = p.size
  const skip = safeOffset.success ? safeOffset.data : undefined
  return { take, skip }
}

import { Pager, StatusEnum } from "@/lib/meta"
import { License } from "@/lib/schemas"
import { License as PcLcs, Prisma } from "@prisma/client"
import { chunk } from "lodash"
import { z } from "zod"
import { LicenseUpdate, Offset } from "../adapter"
import { getPrismaClient } from "./prisma"

type LcsResult = PcLcs & {
  app: { name: string }
  labels: { name: string }[]
}

export async function createAppLicense(
  sample: Omit<License, "key">,
  keys: string[]
): Promise<number> {
  const pc = getPrismaClient()
  const app = await pc.app.findUnique({ where: { name: sample.app } })

  if (!app) {
    throw new Error(`app ${sample.app} not found`)
  }

  await pc.label.createMany({
    data: sample.labels.map((l) => ({ name: l })),
    skipDuplicates: true,
  })

  // find labels and create if not exists
  // const dbLabels = await pc.label.findMany({ where: { name: { in: sample.labels } } });
  // const dbLabelMap = new Map(dbLabels.map(l => [l.name, l.id]));
  // const newLabels = sample.labels.filter(l => !dbLabelMap.has(l));
  // const insertLabels = newLabels.map(l => ({ name: l }));
  // await pc.label.createMany({ data: insertLabels });

  // find all labels
  const allLabels = await pc.label.findMany({
    where: { name: { in: sample.labels } },
  })
  const labelIds = allLabels.map((l) => l.id)

  // chunk keys
  const allP: Array<Promise<Prisma.BatchPayload>> = []

  const chunkedKeys = chunk(keys, 500)

  for (const chunkedKey of chunkedKeys) {
    // create licenses
    const insertData = chunkedKey.map((k) => ({
      licenseKey: k,
      appId: app.id,
      duration: sample.duration,
      totalActCount: sample.totalActCount,
      balanceActCount: sample.balanceActCount,
      validFrom: sample.validFrom,
      rollingDays: sample.rollingDays,
      status: sample.status,
      createdAt: sample.createdAt,
      remark: sample.remark,
      labels: {
        connect: labelIds.map((id) => ({ id })),
      },
    }))

    const p = pc.license.createMany({ data: insertData })
    allP.push(p)
  }

  const results = await Promise.all(allP)
  const successCount = results.reduce((acc, cur) => acc + cur.count, 0)
  return successCount
}

export async function findLicense(key: string): Promise<License | null> {
  const pc = getPrismaClient()
  const lcs = await pc.license.findUnique({
    where: { licenseKey: key },
    include: { app: true, labels: true },
  })

  if (!lcs) {
    return null
  }

  return lcsResultToLicense(lcs)
}

export async function findLicenseByApp(
  appName: string,
  createdAt: Date | undefined,
  asc: boolean,
  pager: Pager
): Promise<[Array<License>, Offset]> {
  const pc = getPrismaClient()
  const safeSkip = z.number().int().min(0).safeParse(pager.offset)
  const take = pager.size
  const order = asc ? "asc" : "desc"

  const lcs = await pc.license.findMany({
    where: { app: { name: appName }, createdAt: { gte: createdAt } },
    skip: safeSkip.success ? safeSkip.data : undefined,
    take,
    orderBy: { createdAt: order },
    include: {
      app: { select: { name: true } },
      labels: { select: { name: true } },
    },
  })

  const result: Array<License> = lcs.map(lcsResultToLicense)

  const lastOffset = lcs.length > 0 ? Number(lcs[lcs.length - 1].id) : undefined
  return [result, lastOffset]
}

export async function saveLicense(
  key: string,
  data: LicenseUpdate
): Promise<License> {
  const pc = getPrismaClient()
  const lcs = await pc.license.update({
    where: { licenseKey: key },
    data: {
      status: data.status,
      remark: data.remark,
      labels: data.labels
        ? {
            connectOrCreate: data.labels.map((l) => ({
              where: { name: l },
              create: { name: l },
            })),
          }
        : undefined,
    },
    include: { app: true, labels: true },
  })

  return lcsResultToLicense(lcs)
}

function lcsResultToLicense(lcs: LcsResult): License {
  return {
    key: lcs.licenseKey,
    app: lcs.app.name,
    createdAt: lcs.createdAt,
    validFrom: lcs.validFrom,
    duration: lcs.duration,
    status: lcs.status as StatusEnum,
    totalActCount: lcs.totalActCount,
    balanceActCount: lcs.balanceActCount,
    remark: lcs.remark,
    labels: lcs.labels.map((l) => l.name),
    rollingDays: lcs.rollingDays,
  }
}

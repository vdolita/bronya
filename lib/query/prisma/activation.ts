import { Pager, StatusEnum } from "@/lib/meta"
import { ActivationRecord } from "@/lib/schemas"
import { Activation } from "@prisma/client"
import { ArUpdate, Offset } from "../adapter"
import { getPrismaClient, toPrismaPager } from "./prisma"

type ArResult = Activation & {
  app: { name: string }
  labels: { name: string }[]
}

export async function addArAndDeductLcs(
  ar: ActivationRecord
): Promise<boolean> {
  const pc = getPrismaClient()
  const lcs = await pc.license.findUnique({ where: { licenseKey: ar.key } })

  if (!lcs) {
    return false
  }

  const newBalance = lcs.balanceActCount - 1

  if (newBalance < 0) {
    return false
  }

  try {
    await pc.$transaction([
      pc.license.update({
        where: { licenseKey: ar.key, balanceActCount: { gt: 0 } },
        data: { balanceActCount: { decrement: 1 } },
      }),
      pc.activation.create({
        data: {
          appId: lcs.appId,
          licenseKey: ar.key,
          identityCode: ar.identityCode,
          activatedAt: ar.activatedAt,
          expireAt: ar.expireAt,
          rollingDays: ar.rollingDays,
          status: ar.status,
          rollingCode: ar.rollingCode,
          lastRollingAt: ar.lastRollingAt,
          remark: ar.remark,
          nxRollingCode: ar.nxRollingCode || "",
        },
      }),
    ])
    return true
  } catch (e) {
    return false
  }
}

export async function getActRecord(
  key: string,
  identityCode: string
): Promise<ActivationRecord | null> {
  const pc = getPrismaClient()
  const pcAr = await pc.activation.findUnique({
    where: {
      licenseKey_identityCode: { licenseKey: key, identityCode },
    },
    include: {
      app: { select: { name: true } },
      labels: { select: { name: true } },
    },
  })

  if (!pcAr) {
    return null
  }

  return arResultToActRecord(pcAr)
}

export async function getActRecordsByKey(
  key: string,
  pager: Pager
): Promise<[Array<ActivationRecord>, Offset]> {
  const pc = getPrismaClient()
  const { take, skip } = toPrismaPager(pager)

  const pcAr = await pc.activation.findMany({
    where: { licenseKey: key },
    include: {
      app: { select: { name: true } },
      labels: { select: { name: true } },
    },
    skip,
    take,
  })

  const result: Array<ActivationRecord> = pcAr.map(arResultToActRecord)

  const lastOffset =
    pcAr.length > 0 ? Number(pcAr[pcAr.length - 1].id) : undefined
  return [result, lastOffset]
}

export async function getActRecordsByAppAndActivatedAt(
  app: string,
  activatedAt: Date | undefined,
  asc: boolean,
  pager: Pager
): Promise<[Array<ActivationRecord>, Offset]> {
  const pc = getPrismaClient()
  const { take, skip } = toPrismaPager(pager)

  const pcAr = await pc.activation.findMany({
    where: { app: { name: app }, activatedAt: { gte: activatedAt } },
    include: {
      app: { select: { name: true } },
      labels: { select: { name: true } },
    },
    orderBy: { activatedAt: asc ? "asc" : "desc" },
    skip,
    take,
  })

  const result: Array<ActivationRecord> = pcAr.map(arResultToActRecord)

  const lastOffset =
    pcAr.length > 0 ? Number(pcAr[pcAr.length - 1].id) : undefined
  return [result, lastOffset]
}

export async function getActRecordsByAppAndExpireAt(
  app: string,
  expireAt: Date | undefined,
  asc: boolean,
  pager: Pager
): Promise<[Array<ActivationRecord>, Offset]> {
  const pc = getPrismaClient()
  const { take, skip } = toPrismaPager(pager)

  const pcAr = await pc.activation.findMany({
    where: { app: { name: app }, expireAt: { gte: expireAt } },
    include: {
      app: { select: { name: true } },
      labels: { select: { name: true } },
    },
    orderBy: { expireAt: asc ? "asc" : "desc" },
    skip,
    take,
  })

  const result: Array<ActivationRecord> = pcAr.map(arResultToActRecord)

  const lastOffset =
    pcAr.length > 0 ? Number(pcAr[pcAr.length - 1].id) : undefined
  return [result, lastOffset]
}

export async function updateActRecordByKey(
  key: string,
  idCode: string,
  data: ArUpdate
): Promise<ActivationRecord> {
  const pc = getPrismaClient()
  const {
    rollingCode,
    nxRollingCode,
    activatedAt,
    expireAt,
    status,
    remark,
    labels,
    lastRollingAt,
  } = data
  const pcAr = await pc.activation.update({
    where: {
      licenseKey_identityCode: { licenseKey: key, identityCode: idCode },
    },
    data: {
      rollingCode: rollingCode,
      nxRollingCode: nxRollingCode,
      activatedAt: activatedAt,
      expireAt: expireAt,
      status: status,
      remark: remark,
      lastRollingAt: lastRollingAt,
      labels: labels?.length
        ? {
            connectOrCreate: labels.map((l) => ({
              where: { name: l },
              create: { name: l },
            })),
          }
        : undefined,
    },
    include: {
      app: { select: { name: true } },
      labels: { select: { name: true } },
    },
  })

  return arResultToActRecord(pcAr)
}

function arResultToActRecord(ar: ArResult): ActivationRecord {
  return {
    key: ar.licenseKey,
    identityCode: ar.identityCode,
    app: ar.app.name,
    activatedAt: ar.activatedAt,
    expireAt: ar.expireAt,
    status: ar.status as StatusEnum,
    rollingDays: ar.rollingDays,
    rollingCode: ar.rollingCode,
    lastRollingAt: ar.lastRollingAt || undefined,
    nxRollingCode: ar.nxRollingCode ? ar.nxRollingCode : undefined,
    remark: ar.remark,
    labels: ar.labels.map((l) => l.name),
  }
}

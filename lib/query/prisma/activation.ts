import { Pager, StatusEnum } from "@/lib/meta"
import { ActivationRecord } from "@/lib/schemas"
import { BadRequestError, InternalError } from "@/lib/utils/error"
import { Activation } from "@prisma/client"
import { isUndefined, values } from "lodash"
import { ArUpdate, IActivationRecordQuery, Offset } from "../adapter"
import { getPrismaClient, toPrismaPager } from "./prisma"

type ArResult = Activation & {
  app: { name: string }
  labels: {
    label: {
      name: string
    }
  }[]
}

async function addArAndDeductLcs(
  ar: ActivationRecord
): Promise<ActivationRecord> {
  const pc = getPrismaClient()
  const lcs = await pc.license.findUnique({
    where: { licenseKey: ar.key },
    include: {
      labels: {
        include: {
          label: true,
        },
      },
    },
  })

  if (!lcs) {
    throw new BadRequestError("Invalid license key")
  }
  const labelIds = lcs.labels.map((l) => l.label.id)

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
          labels: labelIds.length
            ? {
                create: labelIds.map((id) => ({
                  label: {
                    connect: { id },
                  },
                })),
              }
            : undefined,
        },
      }),
    ])

    const newAr = await getActRecord(ar.key, ar.identityCode)
    if (!newAr) {
      throw new InternalError("Operation failed, please try again later")
    }

    return newAr
  } catch (e) {
    throw new BadRequestError("Operation failed, please try again later")
  }
}

async function getActRecord(
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
      labels: { select: { label: { select: { name: true } } } },
    },
  })

  if (!pcAr) {
    return null
  }

  return arResultToActRecord(pcAr)
}

async function getActRecordsByKey(
  key: string,
  pager: Pager
): Promise<[Array<ActivationRecord>, Offset]> {
  const pc = getPrismaClient()
  const { take, skip } = toPrismaPager(pager)

  const pcAr = await pc.activation.findMany({
    where: { licenseKey: key },
    include: {
      app: { select: { name: true } },
      labels: { select: { label: { select: { name: true } } } },
    },
    skip,
    take,
    orderBy: { id: "asc" },
  })

  const result: Array<ActivationRecord> = pcAr.map(arResultToActRecord)
  const lastOffset = result.length < take ? undefined : skip + take

  return [result, lastOffset]
}

async function getActRecordsByAppAndActivatedAt(
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
      labels: { select: { label: { select: { name: true } } } },
    },
    orderBy: [
      { activatedAt: asc ? "asc" : "desc" },
      { id: asc ? "asc" : "desc" },
    ],
    skip,
    take,
  })

  const result: Array<ActivationRecord> = pcAr.map(arResultToActRecord)
  const lastOffset = pcAr.length < take ? undefined : skip + take

  return [result, lastOffset]
}

async function getActRecordsByAppAndExpireAt(
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
      labels: { select: { label: { select: { name: true } } } },
    },
    orderBy: [{ expireAt: asc ? "asc" : "desc" }, { id: asc ? "asc" : "desc" }],
    skip,
    take,
  })

  const result: Array<ActivationRecord> = pcAr.map(arResultToActRecord)
  const lastOffset = result.length < take ? undefined : skip + take

  return [result, lastOffset]
}

async function* findArInRange(
  app: string,
  from: Date | undefined,
  to: Date | undefined
): AsyncGenerator<Array<ActivationRecord>, void> {
  const pc = getPrismaClient()
  const take = 200
  let skip = 0

  do {
    const pcAr = await pc.activation.findMany({
      where: {
        app: { name: app },
        activatedAt: { gte: from, lte: to },
      },
      include: {
        app: { select: { name: true } },
        labels: { select: { label: { select: { name: true } } } },
      },
      orderBy: [{ activatedAt: "asc" }, { id: "asc" }],
      skip,
      take,
    })

    if (pcAr.length === 0) {
      break
    }

    yield pcAr.map(arResultToActRecord)

    if (pcAr.length < take) {
      break
    }
    skip += take
  } while (true)
}

async function updateActRecordByKey(
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
    lastRollingAt,

    labels,
  } = data

  const updateData = {
    rollingCode,
    nxRollingCode,
    activatedAt,
    expireAt,
    status,
    remark,
    lastRollingAt,
  }

  if (!values(updateData).every(isUndefined)) {
    await pc.activation.update({
      where: {
        licenseKey_identityCode: { licenseKey: key, identityCode: idCode },
      },
      data: updateData,
    })
  }

  if (!isUndefined(labels)) {
    await pc.$transaction(async (tx) => {
      // no matter what, clear all labels first
      await tx.activation.update({
        where: {
          licenseKey_identityCode: { licenseKey: key, identityCode: idCode },
        },
        data: {
          labels: {
            deleteMany: {},
          },
        },
      })

      if (labels.length === 0) {
        return
      }

      // create labels if not exists
      await tx.label.createMany({
        data: labels.map((l) => ({ name: l })),
        skipDuplicates: true,
      })

      // connect labels
      await tx.activation.update({
        where: {
          licenseKey_identityCode: { licenseKey: key, identityCode: idCode },
        },
        data: {
          labels: {
            create: labels.map((l) => ({
              label: {
                connect: {
                  name: l,
                },
              },
            })),
          },
        },
      })
    })
  }

  const result = await pc.activation.findUnique({
    where: {
      licenseKey_identityCode: { licenseKey: key, identityCode: idCode },
    },
    include: {
      app: { select: { name: true } },
      labels: { select: { label: { select: { name: true } } } },
    },
  })

  return arResultToActRecord(result!)
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
    labels: ar.labels.map((l) => l.label.name),
  }
}

const actRecordQuery: IActivationRecordQuery = {
  createAndDeduct: addArAndDeductLcs,
  find: getActRecord,
  findMulti: getActRecordsByKey,
  findByAct: getActRecordsByAppAndActivatedAt,
  findByExp: getActRecordsByAppAndExpireAt,
  findInRange: findArInRange,
  update: updateActRecordByKey,
}

export default actRecordQuery

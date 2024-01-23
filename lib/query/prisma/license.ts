import { LcsStatus, Pager } from "@/lib/meta"
import { License } from "@/lib/schemas"
import { License as PcLcs } from "@prisma/client"
import { chunk, isUndefined } from "lodash"
import { ILicenseQuery, LicenseUpdate, Offset } from "../adapter"
import { getPrismaClient, toPrismaPager } from "./prisma"

type LcsResult = PcLcs & {
  app: { name: string }
  labels: {
    label: {
      name: string
    }
  }[]
}

async function createAppLicense(
  sample: Omit<License, "key">,
  keys: string[],
): Promise<number> {
  const pc = getPrismaClient()
  const app = await pc.app.findUnique({ where: { name: sample.app } })

  if (!app) {
    throw new Error(`app ${sample.app} not found`)
  }

  let labelIds: number[] = []
  let successCount = 0

  if (sample.labels.length > 0) {
    // createMany not support for sqlite
    // await pc.label.createMany({
    //   data: sample.labels.map((l) => ({ name: l })),
    //   skipDuplicates: true,
    // })

    for (const label of sample.labels) {
      const l = await pc.label.findUnique({ where: { name: label } })
      if (!l) {
        const created = await pc.label.create({ data: { name: label } })
        labelIds.push(created.id)
      } else {
        labelIds.push(l.id)
      }
    }

    // find all labels
    const allLabels = await pc.label.findMany({
      where: { name: { in: sample.labels } },
    })
    labelIds = allLabels.map((l) => l.id)
  }

  // if no labels, create licenses directly
  if (labelIds.length === 0) {
    const chunkedKeys = chunk(keys, 500)

    // const allP: Array<Promise<Prisma.BatchPayload>> = []
    for (const chunkedKey of chunkedKeys) {
      // create licenses
      const insertData = chunkedKey.map((k) => ({
        appId: app.id,
        balanceActCount: sample.balanceActCount,
        createdAt: sample.createdAt,
        duration: sample.duration,
        licenseKey: k,
        remark: sample.remark,
        rollingDays: sample.rollingDays,
        status: sample.status,
        totalActCount: sample.totalActCount,
        validFrom: sample.validFrom,
      }))

      // createMany not support for sqlite
      // const p = pc.license.createMany({ data: insertData })

      for (const d of insertData) {
        await pc.license.create({ data: d })
        successCount += 1
      }
    }

    // const results = await Promise.all(allP)
    // successCount = results.reduce((acc, cur) => acc + cur.count, 0)

    return successCount
  }

  // if has labels, create licenses with labels
  const chunkedKeys = chunk(keys, 100)
  await pc.$transaction(
    async (tx) => {
      for (const chunkedKey of chunkedKeys) {
        // create licenses
        const lcsInsertData = chunkedKey.map((k) => ({
          appId: app.id,
          balanceActCount: sample.balanceActCount,
          createdAt: sample.createdAt,
          duration: sample.duration,
          licenseKey: k,
          remark: sample.remark,
          rollingDays: sample.rollingDays,
          status: sample.status,
          totalActCount: sample.totalActCount,
          validFrom: sample.validFrom,
        }))

        // const { count } = await tx.license.createMany({ data: lcsInsertData })
        // successCount += count

        for (const d of lcsInsertData) {
          await tx.license.create({ data: d })
          successCount += 1
        }

        // find all licenses with keys
        const insertedLcs = await tx.license.findMany({
          where: { licenseKey: { in: chunkedKey } },
          select: { id: true },
        })

        const lcsLabelInsertData: Array<{
          licenseId: number
          labelId: number
        }> = []

        for (const lcs of insertedLcs) {
          for (const labelId of labelIds) {
            lcsLabelInsertData.push({
              licenseId: lcs.id,
              labelId,
            })
          }
        }

        // await tx.licenseLabel.createMany({
        //   data: lcsLabelInsertData,
        // })

        for (const d of lcsLabelInsertData) {
          await tx.licenseLabel.create({ data: d })
        }
      }
    },
    { timeout: 1000 * 60 * 2 },
  )

  return successCount
}

async function findLicense(key: string): Promise<License | null> {
  const pc = getPrismaClient()
  const lcs = await pc.license.findUnique({
    where: { licenseKey: key },
    include: {
      app: {
        select: { name: true },
      },
      labels: {
        select: { label: { select: { name: true } } },
      },
    },
  })

  if (!lcs) {
    return null
  }

  return lcsResultToLicense(lcs)
}

async function findLicenseByApp(
  appName: string,
  createdAt: Date | undefined,
  asc: boolean,
  pager: Pager,
): Promise<[Array<License>, Offset]> {
  const pc = getPrismaClient()
  const { take, skip } = toPrismaPager(pager)
  const order = asc ? "asc" : "desc"

  const lcs = await pc.license.findMany({
    where: { app: { name: appName }, createdAt: { gte: createdAt } },
    skip,
    take,
    orderBy: [{ createdAt: order }, { id: order }],
    include: {
      app: { select: { name: true } },
      labels: {
        select: { label: { select: { name: true } } },
      },
    },
  })

  const result: Array<License> = lcs.map(lcsResultToLicense)

  const lastOffset = lcs.length < take ? undefined : skip + take
  return [result, lastOffset]
}

async function* findLicensesInRange(
  app: string,
  from: Date | undefined,
  to: Date | undefined,
): AsyncGenerator<Array<License>, void> {
  const pc = getPrismaClient()
  const take = 200
  let skip = 0

  do {
    const lcs = await pc.license.findMany({
      where: {
        app: { name: app },
        createdAt: { gte: from, lte: to },
      },
      include: {
        app: { select: { name: true } },
        labels: {
          select: { label: { select: { name: true } } },
        },
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      skip,
      take,
    })

    if (lcs.length === 0) {
      break
    }

    yield lcs.map(lcsResultToLicense)

    if (lcs.length < take) {
      break
    }

    skip += take
  } while (true)
}

async function saveLicense(key: string, data: LicenseUpdate): Promise<License> {
  const pc = getPrismaClient()
  const { status, remark, labels } = data

  if (!isUndefined(status) || !isUndefined(remark)) {
    await pc.license.update({
      where: { licenseKey: key },
      data: {
        status: data.status,
        remark: data.remark,
      },
      include: {
        app: { select: { name: true } },
        labels: {
          select: { label: { select: { name: true } } },
        },
      },
    })
  }

  if (labels) {
    await pc.$transaction(async (tx) => {
      // no matter what, delete all labels
      await tx.license.update({
        where: { licenseKey: key },
        data: { labels: { deleteMany: {} } },
      })

      if (labels.length === 0) {
        return
      }

      // await tx.label.createMany({
      //   data: labels.map((l) => ({ name: l })),
      //   skipDuplicates: true,
      // })

      for (const label of labels) {
        const l = await tx.label.findUnique({ where: { name: label } })
        if (!l) {
          await tx.label.create({ data: { name: label } })
        }
      }

      // connect labels
      await tx.license.update({
        where: { licenseKey: key },
        data: {
          labels: {
            create: labels.map((l) => ({ label: { connect: { name: l } } })),
          },
        },
      })
    })
  }

  const result = await pc.license.findUnique({
    where: { licenseKey: key },
    include: {
      app: { select: { name: true } },
      labels: {
        select: { label: { select: { name: true } } },
      },
    },
  })

  return lcsResultToLicense(result!)
}

function lcsResultToLicense(lcs: LcsResult): License {
  return {
    key: lcs.licenseKey,
    app: lcs.app.name,
    createdAt: lcs.createdAt,
    validFrom: lcs.validFrom,
    duration: lcs.duration,
    status: lcs.status as LcsStatus,
    totalActCount: lcs.totalActCount,
    balanceActCount: lcs.balanceActCount,
    remark: lcs.remark,
    labels: lcs.labels.map((l) => l.label.name),
    rollingDays: lcs.rollingDays,
  }
}

const licenseQuery: ILicenseQuery = {
  createMulti: createAppLicense,
  find: findLicense,
  findMulti: findLicenseByApp,
  findInRange: findLicensesInRange,
  update: saveLicense,
}

export default licenseQuery

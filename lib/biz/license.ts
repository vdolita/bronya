import { STATUS_ACT } from "@/lib/meta"
import getQueryAdapter from "@/lib/query"
import { v4 as uuidV4 } from "uuid"

export async function createLicense(
  app: string,
  quantity: number,
  days: number,
  totalActTimes: number,
  validFrom: Date,
  rollingDays: number,
  labels: Array<string>
) {
  const q = getQueryAdapter()
  const now = new Date()
  const template = {
    app,
    createdAt: now,
    validFrom,
    duration: days,
    status: STATUS_ACT,
    totalActCount: totalActTimes,
    balanceActCount: totalActTimes,
    remark: "",
    labels: labels,
    rollingDays,
  } as const

  const keys: string[] = []

  for (let i = 0; i < quantity; i++) {
    const key = uuidV4()
    keys.push(key)
  }

  await q.createLicenses(template, keys)
}

import {
  ROLLING_CODE_LENGTH,
  STATUS_ACT,
  STATUS_EXPIRED,
  STATUS_INVALID,
} from "@/lib/meta"
import getQueryAdapter from "@/lib/query"
import { randomStrSync } from "@/lib/utils/random"
import { addDays, isAfter, isBefore } from "date-fns"

export async function arSync(
  app: string,
  key: string,
  identityCode: string,
  rollingCode: string
) {
  const q = getQueryAdapter().actRecord
  const aq = getQueryAdapter().app
  const ar = await q.find(key, identityCode)
  const appData = await aq.find(app)
  const appVersion = appData?.version || "0.0.0"

  const now = new Date()

  const failedResult = {
    status: STATUS_INVALID,
    appVersion,
  }

  if (!ar) {
    return failedResult
  }

  if (ar.app != app) {
    return failedResult
  }

  if (ar.rollingCode != rollingCode && ar.nxRollingCode != rollingCode) {
    return failedResult
  }

  if (ar.status != STATUS_ACT) {
    return { status: ar.status, appVersion }
  }

  // check if expired
  if (isBefore(ar.expireAt, now)) {
    return { status: STATUS_EXPIRED, appVersion }
  }

  // if rolling code equal nx rolling code, update nx rolling code
  if (ar.nxRollingCode == rollingCode) {
    await q.update(key, identityCode, {
      rollingCode: ar.nxRollingCode,
      nxRollingCode: randomStrSync(ROLLING_CODE_LENGTH),
      lastRollingAt: now,
    })

    return { status: ar.status, expireAt: ar.expireAt, appVersion }
  }

  // check rolling days
  if (ar.rollingDays > 0) {
    const lastRollingAt = ar.lastRollingAt || ar.activatedAt
    const nextRollingAt = addDays(lastRollingAt, ar.rollingDays)

    if (isAfter(now, nextRollingAt)) {
      return {
        status: ar.status,
        nxRollingCode: ar.nxRollingCode,
        expireAt: ar.expireAt,
        appVersion,
      }
    }
  }

  return { status: ar.status, expireAt: ar.expireAt, appVersion }
}

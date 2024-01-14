import {
  ROLLING_CODE_LENGTH,
  STATUS_ACT,
  STATUS_DISABLED,
  STATUS_EXPIRED,
} from "@/lib/meta"
import getQueryAdapter from "@/lib/query"
import { ArSyncResult } from "@/lib/schemas"
import { randomStrSync } from "@/lib/utils/random"
import { addDays, isAfter, isBefore } from "date-fns"

export async function arSync(
  app: string,
  key: string,
  identityCode: string,
  rollingCode: string
): Promise<ArSyncResult> {
  const q = getQueryAdapter()
  const ar = await q.getActRecord(key, identityCode)

  const now = new Date()
  const failedResult: ArSyncResult = {
    status: STATUS_DISABLED,
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
    return { status: ar.status }
  }

  // check if expired
  if (isBefore(ar.expireAt, now)) {
    return { status: STATUS_EXPIRED }
  }

  // if rolling code equal nx rolling code, update nx rolling code
  if (ar.nxRollingCode == rollingCode) {
    await q.updateActRecordByKey(key, identityCode, {
      rollingCode: ar.nxRollingCode,
      nxRollingCode: randomStrSync(ROLLING_CODE_LENGTH),
      lastRollingAt: now,
    })

    return { status: ar.status, expireAt: ar.expireAt }
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
      }
    }
  }

  return { status: ar.status, expireAt: ar.expireAt }
}

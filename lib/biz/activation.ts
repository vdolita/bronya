import { ROLLING_CODE_LENGTH, STATUS_ACT, STATUS_ACT_WAIT } from "@/lib/meta"
import getQueryAdapter from "@/lib/query"
import { ActivationRecord } from "@/lib/schemas"
import { BadRequestError, NotFoundError } from "@/lib/utils/error"
import { randomStrSync } from "@/lib/utils/random"
import { addDays, endOfDay } from "date-fns"

export async function activate(app: string, key: string, identityCode: string) {
  const lq = getQueryAdapter().license
  const aq = getQueryAdapter().actRecord
  const license = await lq.findLicense(key)

  if (!license) {
    throw new BadRequestError("Invalid license key")
  }

  // check license balance, status, app
  if (license.balanceActCount <= 0) {
    throw new BadRequestError("Invalid license key")
  }

  // TODO: also need handle act_wait status
  if (license.status !== STATUS_ACT) {
    throw new BadRequestError("Invalid license key")
  }

  if (license.app !== app) {
    throw new BadRequestError("Invalid license key")
  }

  const ar = createActivationRecord(
    key,
    app,
    identityCode,
    license.duration,
    license.rollingDays,
    license.labels
  )

  const isSuccess = await aq.createArAndDeduct(ar)

  if (!isSuccess) {
    throw new BadRequestError("Operation failed")
  }

  return ar
}

export async function actAcknowledgment(
  app: string,
  key: string,
  identityCode: string,
  rollingCode: string
) {
  const q = getQueryAdapter().actRecord
  const ar = await q.findActRecord(key, identityCode)

  if (!ar) {
    throw new NotFoundError("Activation record not found")
  }

  if (ar.app != app) {
    throw new BadRequestError("Invalid operation")
  }

  if (ar.rollingCode != rollingCode) {
    throw new BadRequestError("Invalid rolling code")
  }

  if (ar.status != STATUS_ACT_WAIT) {
    throw new BadRequestError("Invalid operation")
  }

  await q.updateActRecord(ar.key, ar.identityCode, {
    status: STATUS_ACT,
    activatedAt: new Date(),
  })
}

function createActivationRecord(
  key: string,
  app: string,
  identityCode: string,
  duration: number,
  rollingDays: number,
  labels: string[]
): ActivationRecord {
  const rollingCode = randomStrSync(ROLLING_CODE_LENGTH)
  const now = new Date()
  const expireAt = endOfDay(addDays(now, duration))

  const ar: ActivationRecord = {
    key,
    app,
    identityCode,
    rollingCode,
    activatedAt: now,
    expireAt,
    status: STATUS_ACT_WAIT,
    rollingDays,
    remark: "",
    labels,
  }

  if (rollingDays > 0) {
    ar.lastRollingAt = now
    ar.nxRollingCode = randomStrSync(ROLLING_CODE_LENGTH)
  }

  return ar
}

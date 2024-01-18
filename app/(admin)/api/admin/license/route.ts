import { isAuthenticated } from "@/lib/auth/helper"
import { createLicense } from "@/lib/biz/license"
import getQueryAdapter from "@/lib/query"
import {
  License,
  createLicenseReq,
  getLicenseReq,
  updateLicenseReq,
} from "@/lib/schemas"
import {
  handleErrorRes,
  okRes,
  unauthorizedRes,
  zodValidationRes,
} from "@/lib/utils/res"

/**
 * @description get license list
 * @param {string} key - license key
 * @param {string} app - app name
 * @param {string} createdAt - created time
 * @param {number} pageSize - page size
 * @param {string|number|undefined} offset - offset
 */
export async function GET(req: Request) {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return unauthorizedRes()
  }

  const q = getQueryAdapter().license

  const url = new URL(req.url)
  const safeData = getLicenseReq.safeParse(Object.fromEntries(url.searchParams))

  if (!safeData.success) {
    return zodValidationRes(safeData.error)
  }

  const result: License[] = []
  let lastOffset: number | string | undefined = undefined

  // query by key
  if ("key" in safeData.data) {
    const { key } = safeData.data
    const license = await q.find(key)

    if (license) {
      result.push(license)
    }
  }

  // query by app and created time
  if ("app" in safeData.data) {
    const {
      app,
      createdAt,
      pageSize,
      offset,
      createdAtSort: order,
    } = safeData.data

    const [licenses, cursor] = await q.findMulti(
      app,
      createdAt,
      order === "asc",
      {
        size: pageSize,
        offset: offset,
      }
    )

    if (licenses.length > 0) {
      result.push(...licenses)
    }

    lastOffset = cursor
  }

  return okRes({
    data: result,
    lastOffset,
  })
}

/**
 * @description Batch create licenses
 */
export async function POST(req: Request) {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return unauthorizedRes()
  }

  const data: unknown = await req.json()
  const safeData = createLicenseReq.safeParse(data)

  if (!safeData.success) {
    return zodValidationRes(safeData.error)
  }

  const { app, quantity, days, totalActTimes, validFrom, rollingDays, labels } =
    safeData.data
  try {
    await createLicense(
      app,
      quantity,
      days,
      totalActTimes,
      validFrom,
      rollingDays,
      labels
    )

    return okRes()
  } catch (e) {
    return handleErrorRes(e)
  }
}

/**
 * Update single license
 */
export async function PATCH(req: Request) {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return unauthorizedRes()
  }
  const q = getQueryAdapter().license

  const data: unknown = await req.json()
  const safeData = updateLicenseReq.safeParse(data)

  if (!safeData.success) {
    return zodValidationRes(safeData.error)
  }

  const { key, ...rest } = safeData.data
  try {
    const license = await q.update(key, rest)
    // TODO should be able to find license by label

    return okRes(license)
  } catch (e) {
    return handleErrorRes(e)
  }
}

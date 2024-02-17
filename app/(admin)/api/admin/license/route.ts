import { isAuthenticated } from "@/lib/auth/helper"
import { createLicense } from "@/lib/biz/license"
import { viewPermitOfLcs } from "@/lib/permit/permit"
import getQueryAdapter from "@/lib/query"
import { License } from "@/lib/schemas"
import { handleErrorRes, okRes, unauthorizedRes } from "@/lib/utils/res"
import { createLicenseReq, getLicenseReq, updateLicenseReq } from "./req"

export async function GET(req: Request) {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return unauthorizedRes()
  }

  const q = getQueryAdapter().license

  const { searchParams } = new URL(req.url)
  const safeData = getLicenseReq.safeParse(Object.fromEntries(searchParams))

  if (!safeData.success) {
    return handleErrorRes(safeData.error)
  }

  const result: License[] = []
  let lastOffset: number | string | undefined = undefined

  try {
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

      await viewPermitOfLcs(app)

      const [licenses, cursor] = await q.findMulti(
        app,
        createdAt,
        order === "asc",
        {
          pageSize: pageSize,
          offset: offset,
        },
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
  } catch (e) {
    return handleErrorRes(e)
  }
}

export async function POST(req: Request) {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return unauthorizedRes()
  }

  const data: unknown = await req.json()
  const safeData = createLicenseReq.safeParse(data)

  if (!safeData.success) {
    return handleErrorRes(safeData.error)
  }

  const {
    app,
    quantity,
    duration,
    totalActCount,
    validFrom,
    rollingDays,
    labels,
  } = safeData.data
  try {
    await createLicense(
      app,
      quantity,
      duration,
      totalActCount,
      validFrom,
      rollingDays,
      labels,
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
    return handleErrorRes(safeData.error)
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

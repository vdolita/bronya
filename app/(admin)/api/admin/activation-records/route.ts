import { isAuthenticated } from "@/lib/auth/helper"
import getQueryAdapter from "@/lib/query"
import { getActRecordsReq, updateActRecordReq } from "@/lib/schemas"
import {
  handleErrorRes,
  okRes,
  unauthorizedRes,
  zodValidationRes,
} from "@/lib/utils/res"

/**
 * get activation records
 */
export async function GET(req: Request) {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return unauthorizedRes()
  }

  const q = getQueryAdapter().actRecord

  const url = new URL(req.url)
  const safeData = getActRecordsReq.safeParse(
    Object.fromEntries(url.searchParams)
  )

  if (!safeData.success) {
    return zodValidationRes(safeData.error)
  }

  // get activation records by key
  if ("key" in safeData.data) {
    const { key, pageSize, offset } = safeData.data

    const [records, cursor] = await q.findMulti(key, {
      size: pageSize,
      offset,
    })

    return okRes({
      data: records,
      lastOffset: cursor,
    })
  }

  // get activation records by app and expireAt/activatedAt
  const {
    app,
    expireAt,
    expireAtSort,
    activatedAt,
    activatedAtSort,
    pageSize,
    offset,
  } = safeData.data

  if (expireAt || expireAtSort) {
    const [records, cursor] = await q.findByExp(
      app,
      expireAt,
      expireAtSort === "asc",
      { size: pageSize, offset }
    )

    return okRes({
      data: records,
      lastOffset: cursor,
    })
  }

  // fallback to get activation records by app and activatedAt
  const [records, cursor] = await q.findByAct(
    app,
    activatedAt,
    activatedAtSort === "asc",
    { size: pageSize, offset }
  )

  return okRes({
    data: records,
    lastOffset: cursor,
  })
}

/**
 * update activation records
 * @returns
 */
export async function PATCH(req: Request) {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return unauthorizedRes()
  }

  const q = getQueryAdapter().actRecord

  const data: unknown = await req.json()
  const safeData = updateActRecordReq.safeParse(data)

  if (!safeData.success) {
    return zodValidationRes(safeData.error)
  }

  const { key, idCode, ...rest } = safeData.data

  try {
    const record = await q.update(key, idCode, rest)
    return okRes({
      data: record,
    })
  } catch (e) {
    return handleErrorRes(e)
  }
}

import { isAuthenticated } from "@/lib/auth/helper"
import { viewPermitOfAr } from "@/lib/permit/permit"
import getQueryAdapter from "@/lib/query"
import { handleErrorRes, okRes, unauthorizedRes } from "@/lib/utils/res"
import { getActRecordsReq } from "./req"

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
    Object.fromEntries(url.searchParams),
  )

  if (!safeData.success) {
    return handleErrorRes(safeData.error)
  }

  try {
    // get activation records by key
    if ("key" in safeData.data) {
      const { key, pageSize, offset } = safeData.data

      const [records, cursor] = await q.findMulti(key, {
        pageSize: pageSize,
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

    await viewPermitOfAr(app)

    if (expireAt || expireAtSort) {
      const [records, cursor] = await q.findByExp(
        app,
        expireAt,
        expireAtSort === "asc",
        { pageSize: pageSize, offset },
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
      { pageSize: pageSize, offset },
    )

    return okRes({
      data: records,
      lastOffset: cursor,
    })
  } catch (e) {
    return handleErrorRes(e)
  }
}

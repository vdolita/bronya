import { isAuthenticated } from "@/lib/auth/helper"
import { mustBeAdmin } from "@/lib/permit/permit"
import getQueryAdapter from "@/lib/query"
import { handleErrorRes, okRes, unauthorizedRes } from "@/lib/utils/res"
import { getUsersReq } from "./req"

export async function GET(req: Request) {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return unauthorizedRes()
  }

  const { searchParams } = new URL(req.url)
  const safeData = getUsersReq.safeParse(Object.fromEntries(searchParams))
  if (!safeData.success) {
    return handleErrorRes(safeData.error)
  }

  const { pageSize, offset, username } = safeData.data

  try {
    await mustBeAdmin()
    if (username) {
      const q = getQueryAdapter().user
      const user = await q.find(username)

      return okRes(user)
    }

    const q = getQueryAdapter().user
    const [users, cursor] = await q.findMulti({
      pageSize: pageSize,
      offset: offset,
    })

    return okRes({
      data: users.map((u) => ({ ...u, password: "" })),
      lastOffset: cursor,
    })
  } catch (e) {
    return handleErrorRes(e)
  }
}

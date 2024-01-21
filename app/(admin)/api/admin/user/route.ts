import { isAuthenticated } from "@/lib/auth/helper"
import { pager } from "@/lib/meta"
import getQueryAdapter from "@/lib/query"
import { handleErrorRes, okRes, unauthorizedRes } from "@/lib/utils/res"

export async function GET(req: Request) {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return unauthorizedRes()
  }

  const { searchParams } = new URL(req.url)
  const safeData = pager.safeParse(Object.fromEntries(searchParams))
  if (!safeData.success) {
    return handleErrorRes(safeData.error)
  }

  const { pageSize, offset } = safeData.data

  const q = getQueryAdapter().user
  const [users, cursor] = await q.findMulti({
    pageSize: pageSize,
    offset: offset,
  })

  return okRes({
    data: users.map((u) => ({ ...u, password: "" })),
    lastOffset: cursor,
  })
}

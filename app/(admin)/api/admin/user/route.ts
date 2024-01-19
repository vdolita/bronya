import { isAuthenticated } from "@/lib/auth/helper"
import { pager } from "@/lib/meta"
import getQueryAdapter from "@/lib/query"
import { okRes, unauthorizedRes, zodValidationRes } from "@/lib/utils/res"

export async function GET(req: Request) {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return unauthorizedRes()
  }

  const { searchParams } = new URL(req.url)
  const safeData = pager.safeParse(Object.fromEntries(searchParams))
  if (!safeData.success) {
    return zodValidationRes(safeData.error)
  }

  const q = getQueryAdapter().user
  const [users, offset] = await q.findMulti(safeData.data)

  return okRes({
    data: users,
    lastOffset: offset,
  })
}

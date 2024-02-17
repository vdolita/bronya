import { isAuthenticated, sessionHelper } from "@/lib/auth/helper"
import getQueryAdapter from "@/lib/query"
import { okRes, unauthorizedRes } from "@/lib/utils/res"

export async function GET() {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return unauthorizedRes()
  }

  const s = await sessionHelper()
  const username = s!.user!.name!

  const q = getQueryAdapter().user
  const currentUser = await q.find(username)

  return okRes({ ...currentUser, password: "" })
}

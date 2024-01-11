import getQueryAdapter from "@/lib/query"
import { createAppReq } from "@/lib/schemas/app-req"
import { isAuthenticated } from "@/lib/utils/auth"
import { okRes, unauthorizedRes, zodValidationRes } from "@/lib/utils/res"

/**
 * @description get all apps
 */
export async function GET() {
  // check is authenticated
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return unauthorizedRes()
  }

  const q = getQueryAdapter()
  const apps = await q.getApps()
  return okRes(apps)
}

/**
 * @description Create a new app
 */
export async function POST(req: Request) {
  // check is authenticated
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return unauthorizedRes()
  }
  const q = getQueryAdapter()

  const data: unknown = await req.json()
  const safeData = createAppReq.safeParse(data)

  if (!safeData.success) {
    return zodValidationRes(safeData.error)
  }

  await q.addApp(safeData.data.name)

  return okRes()
}

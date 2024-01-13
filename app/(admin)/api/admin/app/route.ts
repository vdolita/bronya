import { createApp } from "@/lib/biz/app"
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
  return okRes(
    apps.map((app) => {
      app.privateKey = ""
      return app
    })
  )
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

  const data: unknown = await req.json()
  const safeData = createAppReq.safeParse(data)

  if (!safeData.success) {
    return zodValidationRes(safeData.error)
  }

  const newApp = safeData.data
  await createApp(newApp.name, newApp.version, newApp.encryptMode)
  return okRes()
}

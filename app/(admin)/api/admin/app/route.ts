import { isAuthenticated } from "@/lib/auth/helper"
import { createApp } from "@/lib/biz/app"
import getQueryAdapter from "@/lib/query"
import { handleErrorRes, okRes, unauthorizedRes } from "@/lib/utils/res"
import { createAppReq, updateAppReq } from "./req"

/**
 * @description get all apps
 */
export async function GET() {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return unauthorizedRes()
  }

  const q = getQueryAdapter().app
  const apps = await q.all()
  return okRes(
    apps.map((app) => {
      app.privateKey = ""
      return app
    })
  )
}

/**
 * @deprecated
 */
export async function POST(req: Request) {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return unauthorizedRes()
  }

  const data: unknown = await req.json()
  const safeData = createAppReq.safeParse(data)

  if (!safeData.success) {
    return handleErrorRes(safeData.error)
  }

  try {
    const newApp = safeData.data
    await createApp(newApp.name, newApp.version, newApp.encryptType)
    return okRes()
  } catch (e) {
    return handleErrorRes(e)
  }
}

/**
 * @deprecated
 */
export async function PATCH(req: Request) {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return unauthorizedRes()
  }

  const data: unknown = await req.json()
  const safeData = updateAppReq.safeParse(data)

  if (!safeData.success) {
    return handleErrorRes(safeData.error)
  }

  const { name, version } = safeData.data
  const q = getQueryAdapter().app
  try {
    const result = await q.update(name, { version })
    return okRes(result)
  } catch (e) {
    return handleErrorRes(e)
  }
}

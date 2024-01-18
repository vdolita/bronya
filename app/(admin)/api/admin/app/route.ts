import { createApp } from "@/lib/biz/app"
import getQueryAdapter from "@/lib/query"
import { createAppReq, updateAppReq } from "@/lib/schemas/app-req"
import { isAuthenticated } from "@/lib/utils/auth"
import {
  handleErrorRes,
  okRes,
  unauthorizedRes,
  zodValidationRes,
} from "@/lib/utils/res"

/**
 * @description get all apps
 */
export async function GET() {
  // check is authenticated
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

  try {
    const newApp = safeData.data
    await createApp(newApp.name, newApp.version, newApp.encryptType)
    return okRes()
  } catch (e) {
    return handleErrorRes(e)
  }
}

/**
 * @description Update an app
 */
export async function PATCH(req: Request) {
  // check is authenticated
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return unauthorizedRes()
  }

  const data: unknown = await req.json()
  const safeData = updateAppReq.safeParse(data)

  if (!safeData.success) {
    return zodValidationRes(safeData.error)
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

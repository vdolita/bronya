import { isAuthenticated, sessionHelper } from "@/lib/auth/helper"
import { AR, LCS, LcsArEnum } from "@/lib/meta"
import {
  getUserPermsArApps,
  getUserPermsLcsApps,
} from "@/lib/permit/permission"
import { isAdminPerm } from "@/lib/permit/permit"
import getQueryAdapter from "@/lib/query"
import {
  badRequestRes,
  handleErrorRes,
  okRes,
  unauthorizedRes,
} from "@/lib/utils/res"
import { getAppListReq } from "./req"

/**
 * @description get all apps
 */
export async function GET(req: Request) {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return unauthorizedRes()
  }

  const { searchParams } = new URL(req.url)
  const safeData = getAppListReq.safeParse(Object.fromEntries(searchParams))

  if (!safeData.success) {
    return handleErrorRes(safeData.error)
  }

  const q = getQueryAdapter().app
  const apps = await q.all()

  if (await isAdminPerm()) {
    return okRes(
      apps.map((app) => {
        app.privateKey = ""
        return app
      }),
    )
  }

  const { type: reqType } = safeData.data

  if (!reqType) {
    return badRequestRes("invalid type parameter")
  }

  const userPermApps = await getUserPermApps(reqType)
  const visibleApps = apps
    .filter((a) => userPermApps.some((uap) => uap === a.name))
    .map((a) => ({ ...a, privateKey: "", publicKey: "" }))

  return okRes(visibleApps)
}

async function getUserPermApps(type: LcsArEnum) {
  const q = getQueryAdapter().user
  const ss = await sessionHelper()
  const username = ss?.user?.name

  if (!username) {
    return []
  }

  const currentUser = await q.find(username)
  if (!currentUser) {
    return []
  }

  const userPerms = currentUser.perms

  if (type === AR) {
    return getUserPermsArApps(userPerms)
  }

  if (type === LCS) {
    return getUserPermsLcsApps(userPerms)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _: never = type

  return []
}

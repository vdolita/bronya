import { sessionHelper } from "../auth/helper"
import { AR, LCS, LcsArEnum } from "../meta"
import getQueryAdapter from "../query"
import { ForbiddenError, NotFoundError } from "../utils/error"
import { getEnforcer } from "./enforce"
import {
  PermAct,
  formateAppArRsc,
  formateAppLcsRsc,
  permActAll,
  permActC,
  permActM,
  permActR,
  permActW,
  permRscAll,
} from "./permission"

export async function canPermit(obj: string, act: PermAct): Promise<boolean> {
  const session = await sessionHelper()
  const sub = session?.user?.name || "anonymous"
  const enforcer = await getEnforcer()
  return enforcer.enforce("u:" + sub, obj, act)
}

async function permit(obj: string, act: PermAct) {
  if (!(await canPermit(obj, act))) {
    throw new ForbiddenError("You are not allowed to perform this action.")
  }
}

export async function isAdminPerm(): Promise<boolean> {
  return canPermit(permRscAll, permActAll)
}

export async function mustBeAdmin() {
  await permit(permRscAll, permActAll)
}

export async function permitOfCreateLcs(app: string) {
  const obj = formateAppLcsRsc(app)
  await permit(obj, permActC)
}

async function mwPermitOfArAndLcs(
  key: string,
  actData: Record<string, unknown>,
  type: LcsArEnum,
) {
  const q = getQueryAdapter().license
  const lcs = await q.find(key)

  if (!lcs) {
    throw new NotFoundError("License not found.")
  }

  const app = lcs.app
  const obj = type === LCS ? formateAppLcsRsc(app) : formateAppArRsc(app)
  const act = getEditActionType(actData)
  await permit(obj, act)
}

export async function mwPermitOfAr(
  key: string,
  actData: Record<string, unknown>,
) {
  await mwPermitOfArAndLcs(key, actData, AR)
}

export async function mwPermitOfLcs(
  key: string,
  actData: Record<string, unknown>,
) {
  await mwPermitOfArAndLcs(key, actData, LCS)
}

export async function viewPermitOfLcs(app: string) {
  const obj = formateAppLcsRsc(app)
  await permit(obj, permActR)
}

export async function viewPermitOfAr(app: string) {
  const obj = formateAppArRsc(app)
  await permit(obj, permActR)
}

function getEditActionType(actData: Record<string, unknown>): PermAct {
  const keys = Object.keys(actData)
  if (keys.length === 1 && keys[0] === "remark") {
    return permActM
  }
  return permActW
}

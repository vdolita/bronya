import { activate } from "@/lib/biz/activation"
import { activationReq } from "@/lib/schemas/activation-req"
import { handleErrorRes, okRes, zodValidationRes } from "@/lib/utils/res"

/**
 * @description Activate with a license
 * @param {string} app - app name
 * @param {string} key - license key
 * @param {string} identityCode - identity code
 */
export async function POST(req: Request) {
  const data: unknown = await req.json()
  const safeData = activationReq.safeParse(data)

  if (!safeData.success) {
    return zodValidationRes(safeData.error)
  }

  const { app, key, identityCode } = safeData.data

  try {
    const activation = await activate(app, key, identityCode)
    return okRes({
      app: activation.app,
      key: activation.key,
      identityCode: activation.identityCode,
      rollingCode: activation.rollingCode,
      expireAt: activation.expireAt,
    })
  } catch (e) {
    return handleErrorRes(e)
  }
}

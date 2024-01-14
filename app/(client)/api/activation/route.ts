import { activate } from "@/lib/biz/activation"
import { encryptData } from "@/lib/biz/app"
import { activationReq } from "@/lib/schemas/activation-req"
import { handleErrorRes, okRes, zodValidationRes } from "@/lib/utils/res"

/**
 * @description Activate with a license
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
    const resData = {
      app: activation.app,
      key: activation.key,
      identityCode: activation.identityCode,
      rollingCode: activation.rollingCode,
      expireAt: activation.expireAt,
    }
    const encryptedData = await encryptData(app, resData)
    return okRes(encryptedData)
  } catch (e) {
    return handleErrorRes(e)
  }
}

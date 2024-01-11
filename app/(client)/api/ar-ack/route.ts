import { actAcknowledgment } from "@/lib/biz/activation"
import { arAckReq } from "@/lib/schemas"
import { handleErrorRes, okRes, zodValidationRes } from "@/lib/utils/res"

/**
 * acknowledge activation record, update activation record status from wait to active
 */
export async function POST(req: Request) {
  const data: unknown = await req.json()

  const safeData = arAckReq.safeParse(data)

  if (!safeData.success) {
    return zodValidationRes(safeData.error)
  }

  const { key, identityCode, rollingCode } = safeData.data

  try {
    await actAcknowledgment(key, identityCode, rollingCode)
    return okRes()
  } catch (e) {
    return handleErrorRes(e)
  }
}

import { actAcknowledgment } from "@/lib/biz/activation"
import { handleErrorRes, okRes } from "@/lib/utils/res"
import { arAckReq } from "./req"

/**
 * acknowledge activation record, update activation record status from wait to active
 */
export async function POST(req: Request) {
  const data: unknown = await req.json()

  const safeData = arAckReq.safeParse(data)

  if (!safeData.success) {
    return handleErrorRes(safeData.error)
  }

  const { app, key, identityCode, rollingCode } = safeData.data

  try {
    await actAcknowledgment(app, key, identityCode, rollingCode)
    return okRes()
  } catch (e) {
    return handleErrorRes(e)
  }
}

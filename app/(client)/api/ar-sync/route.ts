import { encryptData } from "@/lib/biz/app"
import { arSync } from "@/lib/biz/sync"
import { arSyncReq } from "@/lib/schemas"
import { badRequestRes, okRes } from "@/lib/utils/res"

export async function POST(req: Request) {
  const data: unknown = await req.json()

  const safeData = arSyncReq.safeParse(data)

  if (!safeData.success) {
    return badRequestRes()
  }

  const { app, key, identityCode, rollingCode } = safeData.data
  const result = await arSync(app, key, identityCode, rollingCode)
  const encryptedData = await encryptData(app, result)
  return okRes(encryptedData)
}

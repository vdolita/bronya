import { AppName } from "@/lib/meta"
import { CreateAppReq } from "@/lib/schemas"
import { getAppRes } from "@/lib/schemas/app-res"
import { isSuccessRes } from "@/lib/utils/res"

export async function fetchApp(): Promise<AppName[]> {
  const response = await fetch("/api/admin/app")
  const resData: unknown = await response.json()

  const safeData = getAppRes.safeParse(resData)

  if (!safeData.success || !safeData.data.success) {
    throw new Error("fetch data failed")
  }

  const { data: apps } = safeData.data
  return apps
}

export async function createApp(_: string, { arg }: { arg: CreateAppReq }) {
  const res = await fetch("/api/admin/app", {
    method: "POST",
    body: JSON.stringify(arg),
  })
  const resData: unknown = await res.json()
  return isSuccessRes(resData)
}

import { CreateAppReq, UpdateAppReq } from "@/lib/schemas"
import { ClientApp } from "@/lib/schemas/app"
import { getAppRes } from "@/lib/schemas/app-res"
import { isSuccessRes } from "@/lib/utils/res"

export async function fetchApp(): Promise<ClientApp[]> {
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

export async function updateApp(_: string, data: UpdateAppReq) {
  const res = await fetch("/api/admin/app", {
    method: "PATCH",
    body: JSON.stringify(data),
  })
  const resData: unknown = await res.json()
  return isSuccessRes(resData)
}

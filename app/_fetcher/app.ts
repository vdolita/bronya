import { ClientApp } from "@/lib/schemas/app"
import { getAppRes } from "@/lib/schemas/app-res"

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

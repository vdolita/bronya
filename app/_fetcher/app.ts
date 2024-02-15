import { LcsArEnum } from "@/lib/meta"
import { ClientApp, appSchema } from "@/lib/schemas/app"
import { z } from "zod"

export const getAppRes = z.object({
  success: z.boolean(),
  data: z.array(appSchema),
})

export async function fetchApp(type?: LcsArEnum): Promise<ClientApp[]> {
  let url = "/api/admin/app"
  if (type) {
    url += `?type=${type}`
  }

  const response = await fetch(url)
  const resData: unknown = await response.json()

  const safeData = getAppRes.safeParse(resData)

  if (!safeData.success || !safeData.data.success) {
    throw new Error("fetch data failed")
  }

  const { data: apps } = safeData.data
  return apps
}

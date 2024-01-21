import { pageOffset } from "@/lib/meta"
import { licenseSchema } from "@/lib/schemas"
import { z } from "zod"

export const fetchLcsRes = z.object({
  success: z.boolean(),
  data: z.array(licenseSchema),
  lastOffset: pageOffset.optional(),
})

export async function fetchLicenses(url: string) {
  const response = await fetch(url)
  const resData: unknown = await response.json()

  const safeData = fetchLcsRes.safeParse(resData)

  if (!safeData.success || !safeData.data.success) {
    throw new Error("fetch licenses failed")
  }

  const { lastOffset, data: licenses } = safeData.data
  return { licenses: licenses, lastOffset: lastOffset }
}

export async function searchLicense(key: string) {
  const res = await fetch(`/api/admin/license?key=${key}`)
  const resData: unknown = await res.json()
  const safeData = fetchLcsRes.safeParse(resData)

  if (!safeData.success || !safeData.data.success) {
    throw new Error("fetch licenses failed")
  }

  const { lastOffset, data: licenses } = safeData.data
  return { licenses: licenses, lastOffset: lastOffset }
}

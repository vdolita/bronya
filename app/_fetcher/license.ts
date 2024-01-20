import { fetchLcsRes } from "@/lib/schemas/license-res"

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

import { CreateLicenseReq, UpdateLicenseReq } from "@/lib/schemas"
import { fetchLcsRes } from "@/lib/schemas/license-res"
import { isSuccessRes } from "@/lib/utils/res"

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

export async function updateLicense(
  key: string,
  license: Omit<UpdateLicenseReq, "key">
) {
  const response = await fetch("/api/admin/license", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...license,
      key,
    }),
  })
  const resData: unknown = await response.json()
  return isSuccessRes(resData)
}

export async function createLicense(
  _: string,
  { arg }: { arg: CreateLicenseReq }
) {
  const res = await fetch("/api/admin/license", {
    method: "POST",
    body: JSON.stringify(arg),
  })
  const resData: unknown = await res.json()
  return isSuccessRes(resData)
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

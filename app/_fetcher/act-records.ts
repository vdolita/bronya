import { fetchArRes } from "@/lib/schemas/ar-res"

export async function fetchActRecords(url: string) {
  const response = await fetch(url.toString())
  const resData: unknown = await response.json()

  const safeData = fetchArRes.safeParse(resData)
  if (!safeData.success || !safeData.data.success) {
    throw new Error("fetch data failed")
  }

  const { lastOffset, data: actRecords } = safeData.data
  return { actRecords: actRecords, lastOffset: lastOffset }
}

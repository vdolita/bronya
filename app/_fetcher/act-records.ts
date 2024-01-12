import { UpdateActRecordReq } from "@/lib/schemas"
import { fetchArRes } from "@/lib/schemas/ar-res"
import { isSuccessRes } from "@/lib/utils/res"

export async function fetchActRecords(url: string) {
  const response = await fetch(url.toString())
  const resData: unknown = await response.json()

  const safeData = fetchArRes.safeParse(resData)
  if (!safeData.success || !safeData.data.success) {
    throw new Error("fetch data failed")
  }

  await new Promise((resolve) => setTimeout(resolve, 5000)) // Wait for 2 seconds

  const { lastOffset, data: actRecords } = safeData.data
  return { actRecords: actRecords, lastOffset: lastOffset }
}

export async function updateActRecord(
  key: string,
  idCode: string,
  data: Omit<UpdateActRecordReq, "key" | "idCode">
) {
  const response = await fetch("/api/admin/activation-records", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      key,
      idCode,
    }),
  })
  const res: unknown = await response.json()
  return isSuccessRes(res)
}

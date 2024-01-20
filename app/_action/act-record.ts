"use server"

import { isAuthenticated } from "@/lib/auth/helper"
import getQueryAdapter from "@/lib/query"
import { UpdateActRecordReq, updateActRecordReq } from "@/lib/schemas"
import { BronyaRes, parseErrRes } from "@/lib/utils/res"
import { redirect } from "next/navigation"

/**
 * update activation records
 * @returns
 */
export async function updateArAction(
  data: UpdateActRecordReq
): Promise<BronyaRes> {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return redirect("/auth/login")
  }

  const q = getQueryAdapter().actRecord

  const safeData = updateActRecordReq.safeParse(data)

  if (!safeData.success) {
    return parseErrRes(safeData.error)
  }

  const { key, idCode, ...rest } = safeData.data

  try {
    const record = await q.update(key, idCode, rest)
    return { success: true, data: record }
  } catch (e) {
    return parseErrRes(e)
  }
}

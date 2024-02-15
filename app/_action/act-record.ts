"use server"

import { isAuthenticated } from "@/lib/auth/helper"
import { mwPermitOfArAndLcs } from "@/lib/permit/permit"
import getQueryAdapter from "@/lib/query"
import { BronyaRes, parseErrRes } from "@/lib/utils/res"
import { redirect } from "next/navigation"
import { UpdateArData, updateArData } from "./ar-req"

export async function updateArAction(data: UpdateArData): Promise<BronyaRes> {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return redirect("/auth/login")
  }

  const safeData = updateArData.safeParse(data)

  if (!safeData.success) {
    return parseErrRes(safeData.error)
  }

  const { key, identityCode, ...rest } = safeData.data

  try {
    await mwPermitOfArAndLcs(key, rest)

    const q = getQueryAdapter().actRecord
    const record = await q.update(key, identityCode, rest)
    return { success: true, data: record }
  } catch (e) {
    return parseErrRes(e)
  }
}

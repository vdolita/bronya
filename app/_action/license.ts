"use server"

import { isAuthenticated } from "@/lib/auth/helper"
import { createLicense } from "@/lib/biz/license"
import getQueryAdapter from "@/lib/query"
import { BronyaRes, parseErrRes } from "@/lib/utils/res"
import { redirect } from "next/navigation"
import {
  CreateLcsData,
  UpdateLcsData,
  createLcsData,
  updateLcsData,
} from "./license-req"

export async function createLicensesAction(
  data: CreateLcsData,
): Promise<BronyaRes> {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return redirect("/auth/login")
  }

  const safeData = createLcsData.safeParse(data)

  if (!safeData.success) {
    return parseErrRes(safeData.error)
  }

  const {
    app,
    quantity,
    duration,
    totalActCount,
    validFrom,
    rollingDays,
    labels,
  } = safeData.data

  try {
    await createLicense(
      app,
      quantity,
      duration,
      totalActCount,
      validFrom,
      rollingDays,
      labels,
    )

    return { success: true }
  } catch (e) {
    return parseErrRes(e)
  }
}

export async function updateLcsAction(data: UpdateLcsData): Promise<BronyaRes> {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return redirect("/auth/login")
  }

  const q = getQueryAdapter().license
  const safeData = updateLcsData.safeParse(data)

  if (!safeData.success) {
    return parseErrRes(safeData.error)
  }

  const { key, ...rest } = safeData.data
  try {
    const license = await q.update(key, rest)
    // TODO should be able to find license by label

    return { success: true, data: license }
  } catch (e) {
    return parseErrRes(e)
  }
}

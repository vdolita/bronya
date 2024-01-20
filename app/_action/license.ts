"use server"

import { isAuthenticated } from "@/lib/auth/helper"
import { createLicense } from "@/lib/biz/license"
import getQueryAdapter from "@/lib/query"
import {
  CreateLicenseReq,
  UpdateLicenseReq,
  createLicenseReq,
  updateLicenseReq,
} from "@/lib/schemas"
import { BronyaRes, parseErrRes } from "@/lib/utils/res"
import { redirect } from "next/navigation"

export async function createLicensesAction(
  data: CreateLicenseReq
): Promise<BronyaRes> {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return redirect("/auth/login")
  }

  const safeData = createLicenseReq.safeParse(data)

  if (!safeData.success) {
    return parseErrRes(safeData.error)
  }

  const { app, quantity, days, totalActTimes, validFrom, rollingDays, labels } =
    safeData.data
  try {
    await createLicense(
      app,
      quantity,
      days,
      totalActTimes,
      validFrom,
      rollingDays,
      labels
    )

    return { success: true }
  } catch (e) {
    return parseErrRes(e)
  }
}

export async function updateLcsAction(
  data: UpdateLicenseReq
): Promise<BronyaRes> {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return redirect("/auth/login")
  }

  const q = getQueryAdapter().license

  const safeData = updateLicenseReq.safeParse(data)

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

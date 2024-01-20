"use server"

import { isAuthenticated } from "@/lib/auth/helper"
import { createApp } from "@/lib/biz/app"
import getQueryAdapter from "@/lib/query"
import {
  CreateAppReq,
  UpdateAppReq,
  createAppReq,
  updateAppReq,
} from "@/lib/schemas"
import { BronyaRes, parseErrRes } from "@/lib/utils/res"
import { redirect } from "next/navigation"

export async function createAppAction(data: CreateAppReq): Promise<BronyaRes> {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return redirect("/auth/login")
  }

  const safeData = createAppReq.safeParse(data)

  if (!safeData.success) {
    return parseErrRes(safeData.error)
  }

  try {
    const newApp = safeData.data
    await createApp(newApp.name, newApp.version, newApp.encryptType)
    return { success: true }
  } catch (e) {
    return parseErrRes(e)
  }
}

export async function updateAppAction(data: UpdateAppReq): Promise<BronyaRes> {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return redirect("/auth/login")
  }

  const safeData = updateAppReq.safeParse(data)

  if (!safeData.success) {
    return parseErrRes(safeData.error)
  }

  const { name, version } = safeData.data
  const q = getQueryAdapter().app
  try {
    await q.update(name, { version })
    return { success: true }
  } catch (e) {
    return parseErrRes(e)
  }
}

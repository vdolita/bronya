"use server"

import { isAuthenticated } from "@/lib/auth/helper"
import { createApp } from "@/lib/biz/app"
import getQueryAdapter from "@/lib/query"
import { BronyaRes, parseErrRes } from "@/lib/utils/res"
import { redirect } from "next/navigation"
import {
  CreateAppData,
  UpdateAppData,
  createAppData,
  updateAppData,
} from "./app-req"

export async function createAppAction(data: CreateAppData): Promise<BronyaRes> {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return redirect("/auth/login")
  }

  const safeData = createAppData.safeParse(data)

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

export async function updateAppAction(data: UpdateAppData): Promise<BronyaRes> {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return redirect("/auth/login")
  }

  const safeData = updateAppData.safeParse(data)

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

"use server"

import { isAuthenticated } from "@/lib/auth/helper"
import { createAdminUser, createUser, updateUser } from "@/lib/biz/user"
import { BronyaRes, parseErrRes } from "@/lib/utils/res"
import { redirect } from "next/navigation"
import {
  CreateAdminData,
  CreateUserData,
  UpdateUserData,
  createAdminData,
  createUserData,
  updateUserData,
} from "./user-req"

export async function createUserAction(
  data: CreateUserData,
): Promise<BronyaRes> {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return redirect("/auth/login")
  }

  const safeData = createUserData.safeParse(data)
  if (!safeData.success) {
    return parseErrRes(safeData.error)
  }

  const { username, password, perms } = safeData.data

  try {
    await createUser(username, password, perms)
    return { success: true }
  } catch (e) {
    return parseErrRes(e)
  }
}

export async function createAdminUserAction(
  user: CreateAdminData,
): Promise<BronyaRes> {
  const safeData = createAdminData.safeParse(user)
  if (!safeData.success) {
    return parseErrRes(safeData.error)
  }

  const { username, password } = safeData.data

  try {
    await createAdminUser(username, password)
    return { success: true }
  } catch (err) {
    return parseErrRes(err)
  }
}

export async function updateUserAction(
  username: string,
  data: UpdateUserData,
): Promise<BronyaRes> {
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return redirect("/auth/login")
  }

  const safeData = updateUserData.safeParse(data)
  if (!safeData.success) {
    return parseErrRes(safeData.error)
  }

  const { password, status, perms } = safeData.data

  try {
    await updateUser(username, password, status, perms)
    return { success: true }
  } catch (err) {
    return parseErrRes(err)
  }
}

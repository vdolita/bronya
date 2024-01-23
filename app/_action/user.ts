"use server"

import { createAdminUser, createUser } from "@/lib/biz/user"
import { BronyaRes, parseErrRes } from "@/lib/utils/res"
import {
  CreateAdminData,
  CreateUserData,
  createAdminData,
  createUserData,
} from "./user-req"

export async function createUserAction(
  data: CreateUserData,
): Promise<BronyaRes> {
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

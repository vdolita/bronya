"use server"

import { createAdminUser, createUser } from "@/lib/biz/user"
import { User } from "@/lib/schemas"
import {
  CreateUserReq,
  createAdminUserReq,
  createUserReq,
} from "@/lib/schemas/user-req"
import { BronyaRes, parseErrRes } from "@/lib/utils/res"

export async function createUserAction(
  data: CreateUserReq
): Promise<BronyaRes> {
  const safeData = createUserReq.safeParse(data)
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

export async function createAdminUserAction(user: User): Promise<BronyaRes> {
  const safeData = createAdminUserReq.safeParse(user)
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

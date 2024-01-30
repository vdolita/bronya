import bcrypt from "bcrypt"
import { STATUS_ACT, UserStatus } from "../meta"
import { UserPerms, permActAll, permRscAll } from "../permit/permission"
import getQueryAdapter from "../query"
import { User } from "../schemas"
import { isSystemInitialed } from "../system"
import { BadRequestError } from "../utils/error"

export async function createAdminUser(
  username: string,
  password: string,
): Promise<User> {
  // check system initialized
  const isInitialed = await isSystemInitialed()
  if (isInitialed) {
    throw new BadRequestError("System already initialized")
  }

  return await createUser(username, password, [
    {
      sub: username,
      obj: permRscAll,
      act: permActAll,
    },
  ])
}

export async function createUser(
  username: string,
  password: string,
  perms: UserPerms,
  status: UserStatus = STATUS_ACT,
): Promise<User> {
  const q = getQueryAdapter().user

  // encrypt password
  const hashPwd = encryptPassword(password)

  // create user
  const user = await q.create({
    username,
    password: hashPwd,
    status: status,
    perms: perms,
  })

  return user
}

export async function updateUser(
  username: string,
  password?: string,
  status?: UserStatus,
  perms?: UserPerms,
) {
  const q = getQueryAdapter().user

  // update user
  await q.update(username, {
    password: password ? encryptPassword(password) : undefined,
    status,
    perms,
  })
}

function encryptPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

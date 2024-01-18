import bcrypt from "bcrypt"
import getQueryAdapter from "../query"
import { User } from "../schemas"
import { BadRequestError } from "../utils/error"

export async function createAdminUser(
  username: string,
  password: string
): Promise<User> {
  // check system initialized
  const q = getQueryAdapter().user
  const count = await q.count()
  if (count > 0) {
    throw new BadRequestError("System already initialized")
  }

  // encrypt password
  const hashPwd = encryptPassword(password)

  // create user
  const user = await q.create(username, hashPwd)
  return user
}

function encryptPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

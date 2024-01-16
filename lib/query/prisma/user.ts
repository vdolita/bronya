import { IUserQuery } from "../adapter"
import { getPrismaClient } from "./prisma"

async function getUserByUsername(username: string) {
  const pc = getPrismaClient()
  const user = await pc.user.findUnique({
    where: { name: username },
    select: { name: true, password: true },
  })
  if (!user) {
    return null
  }

  return {
    username: user.name,
    password: user.password,
  }
}

const userQuery: IUserQuery = {
  findUser: getUserByUsername,
}

export default userQuery

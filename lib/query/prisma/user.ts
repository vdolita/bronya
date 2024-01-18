import { User } from "@/lib/schemas/user"
import { IUserQuery } from "../adapter"
import { getPrismaClient } from "./prisma"

async function getUserByUsername(username: string): Promise<User | null> {
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

async function createUser(name: string, password: string): Promise<User> {
  const pc = getPrismaClient()
  const user = await pc.user.create({
    data: {
      name,
      password,
    },
  })
  return {
    username: user.name,
    password: user.password,
  }
}

async function countUser(): Promise<number> {
  const pc = getPrismaClient()
  const count = await pc.user.count()
  return count
}

const userQuery: IUserQuery = {
  find: getUserByUsername,
  count: countUser,
  create: createUser,
}

export default userQuery

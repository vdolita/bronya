import { Pager, UserStatus } from "@/lib/meta"
import { UserPerms } from "@/lib/meta/permission"
import { User } from "@/lib/schemas/user"
import { User as PrUser } from "@prisma/client"
import { IUserQuery, Offset } from "../adapter"
import { getPrismaClient, toPrismaPager } from "./prisma"

async function getUserByUsername(username: string): Promise<User | null> {
  const pc = getPrismaClient()
  const user = await pc.user.findUnique({
    where: { name: username },
  })
  if (!user) {
    return null
  }

  return prUserToUser(user)
}

async function getUsers(pager: Pager): Promise<[Array<User>, Offset]> {
  const pc = getPrismaClient()
  const { take, skip } = toPrismaPager(pager)
  const users = await pc.user.findMany({
    skip,
    take,
    orderBy: { id: "asc" },
  })

  const lastOffset = users.length < take ? undefined : skip + take
  return [users.map(prUserToUser), lastOffset]
}

async function createUser(user: User): Promise<User> {
  const pc = getPrismaClient()
  const newUser = await pc.user.create({
    data: userToPrUser(user),
  })

  return prUserToUser(newUser)
}

async function countUser(): Promise<number> {
  const pc = getPrismaClient()
  const count = await pc.user.count()
  return count
}

function userToPrUser(u: User): Omit<PrUser, "id"> {
  return {
    name: u.username,
    password: u.password,
    status: u.status,
    perms: u.perms.join(","),
  }
}

function prUserToUser(u: Omit<PrUser, "id">): User {
  return {
    username: u.name,
    password: u.password,
    status: u.status as UserStatus,
    perms: u.perms.split(",") as UserPerms,
  }
}

const userQuery: IUserQuery = {
  find: getUserByUsername,
  findMulti: getUsers,
  count: countUser,
  create: createUser,
}

export default userQuery

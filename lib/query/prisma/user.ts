import { Pager, UserStatus } from "@/lib/meta"
import { PermAct } from "@/lib/permit/permission"
import { User } from "@/lib/schemas/user"
import { Permission, User as PrUser } from "@prisma/client"
import { isUndefined } from "lodash"
import { IUserQuery, Offset, UserUpdate } from "../adapter"
import { getPrismaClient, toPrismaPager } from "./prisma"

type PrUserWithPerms = PrUser & {
  perms: Array<Omit<Permission, "id" | "username">>
}

async function getUserByUsername(username: string): Promise<User | null> {
  const pc = getPrismaClient()
  const user = await pc.user.findUnique({
    where: { name: username },
    include: {
      perms: {
        select: {
          resource: true,
          action: true,
        },
      },
    },
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
    include: {
      perms: {
        select: {
          resource: true,
          action: true,
        },
      },
    },
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
    data: {
      ...userToPrUser(user),
      perms: {
        createMany: {
          data: user.perms.map((p) => ({
            resource: p.obj,
            action: p.act,
          })),
        },
      },
    },
    include: {
      perms: {
        select: {
          resource: true,
          action: true,
        },
      },
    },
  })

  return prUserToUser(newUser)
}

async function updateUser(username: string, data: UserUpdate): Promise<void> {
  const pc = getPrismaClient()
  const { password, status, perms } = data

  if (!isUndefined(password) || !isUndefined(status)) {
    await pc.user.update({
      where: { name: username },
      data: {
        password: data.password,
        status: data.status,
      },
    })
  }

  if (!isUndefined(perms)) {
    await pc.$transaction([
      pc.permission.deleteMany({
        where: { username },
      }),
      pc.permission.createMany({
        data: perms.map((p) => ({
          username,
          resource: p.obj,
          action: p.act,
        })),
      }),
    ])
  }
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
  }
}

function prUserToUser(u: PrUserWithPerms): User {
  const user: User = {
    username: u.name,
    password: u.password,
    status: u.status as UserStatus,
    perms: u.perms.map((p) => ({
      sub: u.name,
      obj: p.resource,
      act: p.action as PermAct,
    })),
  }

  return user
}

const userQuery: IUserQuery = {
  find: getUserByUsername,
  findMulti: getUsers,
  count: countUser,
  create: createUser,
  update: updateUser,
}

export default userQuery

import { Perm, PermAct, UserPerms } from "@/lib/permit/permission"
import { IPermissionQuery } from "../adapter"
import { getPrismaClient } from "./prisma"

async function getAll(): Promise<UserPerms> {
  const pc = getPrismaClient()
  const perms = await pc.permission.findMany({
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  })

  return perms.map((p) => ({
    sub: p.user.name,
    obj: p.resource,
    act: p.action as PermAct,
  }))
}

async function addPermission(data: Perm) {
  const pc = getPrismaClient()
  await pc.permission.create({
    data: {
      resource: data.obj,
      action: data.act,
      user: {
        connect: {
          name: data.sub,
        },
      },
    },
  })
}

async function removePermission(data: Perm) {
  const pc = getPrismaClient()
  await pc.permission.delete({
    where: {
      username_resource_action: {
        username: data.sub,
        resource: data.obj,
        action: data.act,
      },
    },
  })
}

const permissionQuery: IPermissionQuery = {
  all: getAll,
  add: addPermission,
  remove: removePermission,
}

export default permissionQuery

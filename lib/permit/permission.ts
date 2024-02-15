import { z } from "zod"

export const permRscAll = "*"
/** app resource */
export const permRscApp = "app"
/** license resource */
export const permRscLcs = "lcs"
/** activation record resource */
export const permRscAr = "ar"

/** action view */
export const permActR = "r"
/** action write, include all editable feature */
export const permActW = "w"
/** action create */
export const permActC = "c"
/** action remark */
export const permActM = "m"
/** action all */
export const permActAll = "*"
export const permAct = z.enum([
  permActR,
  permActW,
  permActC,
  permActM,
  permActAll,
])
export type PermAct = z.infer<typeof permAct>

export const perm = z.object({
  sub: z.string(),
  obj: z.string().refine(
    (v) => {
      if (v === permRscAll) return true

      // should meet format: app/appName/resourceType
      const arr = v.split("/")
      if (arr.length !== 3) return false
      if (arr[0] !== "app") return false
      if (arr[1] === "") return false
      if (arr[2] !== permRscAr && arr[2] !== permRscLcs) return false

      return true
    },
    { message: "invalid resource" },
  ),
  act: permAct,
})

export type Perm = z.infer<typeof perm>

export const userPerms = z.array(perm)
export type UserPerms = z.infer<typeof userPerms>

export const adminPerm = `${permRscAll}.${permActAll}`

export const formateAppLcsRsc = (appName: string) => {
  return `${permRscApp}/${appName}/${permRscLcs}`
}

export const getUserPermsLcsApps = (perms: UserPerms): string[] => {
  const filteredPerms = perms
    .filter((p) => p.obj.startsWith(permRscApp))
    .filter((p) => p.obj.endsWith(permRscLcs))
    .filter((p) => p.obj.split("/").length === 3)
    .filter((p) => (p.act = permActR))

  return filteredPerms.map((p) => p.obj.split("/")[1])
}

export const formateAppArRsc = (appName: string) => {
  return `${permRscApp}/${appName}/${permRscAr}`
}

export const getUserPermsArApps = (perms: UserPerms): string[] => {
  const filteredPerms = perms
    .filter((p) => p.obj.startsWith(permRscApp))
    .filter((p) => p.obj.endsWith(permRscAr))
    .filter((p) => p.obj.split("/").length === 3)
    .filter((p) => (p.act = permActR))

  return filteredPerms.map((p) => p.obj.split("/")[1])
}

export const actMapper = {
  r: "View",
  w: "Edit",
  c: "Create",
  m: "Remark",
  "*": "All",
} as const

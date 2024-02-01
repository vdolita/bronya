import { z } from "zod"

export const permRscAll = "*"
/** user resource */
export const permRscUser = "user"
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
export const permActRk = "m"
/** action all */
export const permActAll = "*"
export const permAct = z.enum([
  permActR,
  permActW,
  permActC,
  permActRk,
  permActAll,
])
export type PermAct = z.infer<typeof permAct>

export const perm = z.object({
  sub: z.string(),
  obj: z.string().refine(
    (v) => {
      if (v === permRscAll || v === permRscUser) return true

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

export const formateAppArRsc = (appName: string) => {
  return `${permRscApp}/${appName}/${permRscAr}`
}

export const actMapper = {
  r: "View",
  w: "Edit",
  c: "Create",
  m: "Remark",
  "*": "All",
} as const

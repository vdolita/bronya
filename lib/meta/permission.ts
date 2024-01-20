import { z } from "zod"

/** admin */
export const permAdmin = "admin"

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
export const permActRk = "rk"

/** view user */
export const permUserR = `${permRscUser}:${permActR}`

/** edit user */
export const permUserW = `${permRscUser}:${permActW}`

/** view license */
export const permLcsR = `${permRscLcs}:${permActR}`

/** edit license */
export const permLcsW = `${permRscLcs}:${permActW}`

/** edit license remark */
export const permLcsRk = `${permRscLcs}:${permActRk}`

/** create license */
export const permLcsC = `${permRscLcs}:${permActC}`

/** view activation record */
export const permArR = `${permRscAr}:${permActR}`

/** edit activation record */
export const permArSt = `${permRscAr}:${permActW}`

/** edit activation record remark */
export const permArRk = `${permRscAr}:${permActRk}`

const permArr = [
  permAdmin,
  permUserR,
  permUserW,
  permLcsR,
  permLcsW,
  permLcsRk,
  permLcsC,
  permArR,
  permArSt,
  permArRk,
] as const

export const perm = z.enum(permArr)
export type Perm = z.infer<typeof perm>

export const userPerms = z.array(perm)
export type UserPerms = z.infer<typeof userPerms>

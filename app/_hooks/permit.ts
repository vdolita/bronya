import { PermAct, permActAll, permRscAll } from "@/lib/permit/permission"
import useSWR from "swr"
import { fetchMe } from "../_fetcher/user"

const SWR_PERMIT_KEY = "/admin/api/user/me"

export function usePermit(act: PermAct, obj: string): boolean {
  const { data } = useSWR(SWR_PERMIT_KEY, fetchMe, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })

  const userPerms = data?.data.perms || []

  const isAdmin = userPerms.some(
    (p) => p.act === permActAll && p.obj === permRscAll,
  )

  if (isAdmin) {
    return true
  }

  const isPass = userPerms.some((p) => p.act === act && p.obj === obj)
  return isPass
}

export function useAdminPermit(): boolean {
  const { data } = useSWR(SWR_PERMIT_KEY, fetchMe, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })

  const userPerms = data?.data.perms || []

  const isAdmin = userPerms.some(
    (p) => p.act === permActAll && p.obj === permRscAll,
  )

  return isAdmin
}

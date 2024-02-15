import { LcsArEnum } from "@/lib/meta"
import { ClientApp } from "@/lib/schemas/app"
import useSwr from "swr"
import { fetchApp } from "../_fetcher/app"

export function useAppList(type?: LcsArEnum) {
  const { data, isLoading, mutate, isValidating, error } = useSwr<
    ClientApp[],
    unknown
  >(
    ["/api/admin/app", type],
    ([, reqType]: [string, LcsArEnum | undefined]) => fetchApp(reqType),
    {
      revalidateOnFocus: false,
    },
  )

  return {
    data,
    isLoading,
    mutate,
    error,
    isValidating,
  }
}

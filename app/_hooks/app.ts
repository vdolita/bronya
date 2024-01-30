import { ClientApp } from "@/lib/schemas/app"
import useSwr from "swr"
import { fetchApp } from "../_fetcher/app"

export function useAppList() {
  const { data, isLoading, mutate, isValidating, error } = useSwr<
    ClientApp[],
    unknown
  >("/api/admin/app", fetchApp, {
    revalidateOnFocus: false,
  })

  return {
    data,
    isLoading,
    mutate,
    error,
    isValidating,
  }
}

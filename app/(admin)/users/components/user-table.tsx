"use client"

import { fetchUser } from "@/app/_fetcher/user"
import { DataTable } from "@/components/data-table"
import useSWRInfinite from "swr/infinite"
import columns from "./columns"
import CreateUserDialog from "./create-user"

const PAGE_SIZE = 20

export default function UserListTable() {
  const getKey = (
    _: number,
    preData: Awaited<ReturnType<typeof fetchUser>> | undefined,
  ) => {
    if (preData && !preData.lastOffset) return null

    const url = new URL("/api/admin/user", window?.location.origin)
    url.searchParams.set("pageSize", PAGE_SIZE.toString())

    if (preData?.lastOffset) {
      url.searchParams.set("offset", preData.lastOffset.toString())
    }

    return url.toString()
  }

  const { data, isLoading, setSize } = useSWRInfinite(getKey, fetchUser, {
    revalidateOnFocus: false,
    revalidateAll: true,
    refreshInterval: 1000 * 60 * 1,
  })

  const users = data?.flatMap((item) => item.users) ?? []
  const hadMore =
    data && data.length > 0 && data[data.length - 1].lastOffset != null

  const handleLoadMore = () => {
    void setSize((size) => size + 1)
  }

  return (
    <div className="flex flex-col space-y-4 h-full">
      <div className="self-end">
        <CreateUserDialog />
      </div>
      <div className="grow">
        <DataTable
          data={users}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => `${row.username}`}
          loadMore={handleLoadMore}
          hadMore={hadMore}
        />
      </div>
    </div>
  )
}

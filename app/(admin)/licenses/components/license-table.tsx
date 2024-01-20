"use client"

import CreateLicenseDialog from "@/app/(admin)/licenses/components/create-lcs-dialog"
import { updateLcsAction } from "@/app/_action/license"
import AppSelect from "@/app/_components/app-select"
import KeySearch from "@/app/_components/table/key-search"
import { fetchLicenses } from "@/app/_fetcher/license"
import { DataTable } from "@/components/data-table"
import DatePicker from "@/components/date-picker"
import { License } from "@/lib/schemas"
import { Label } from "@/sdui/ui/label"
import { SortingState } from "@tanstack/react-table"
import { useCallback, useMemo, useState } from "react"
import useSWRInfinite from "swr/infinite"
import columns from "./columns"

const PAGE_SIZE = 10

export default function LicenseTable() {
  const [app, setApp] = useState<string | undefined>()
  const [searchKey, setSearchKey] = useState<string>("")
  const [createdAt, setCreatedAt] = useState<Date | undefined>()
  const [sortingState, setSortingState] = useState<SortingState>([
    {
      id: "createdAt",
      desc: false,
    },
  ])

  const getKey = (
    _: number,
    preData: Awaited<ReturnType<typeof fetchLicenses>> | undefined
  ) => {
    if (!app) return null
    if (preData && !preData.lastOffset) return null

    const url = new URL("/api/admin/license", window?.location.origin)
    url.searchParams.set("app", app)
    url.searchParams.set("pageSize", PAGE_SIZE.toString())

    if (searchKey) url.searchParams.set("key", searchKey)
    if (createdAt) url.searchParams.set("createdAt", createdAt.toISOString())
    if (preData?.lastOffset) {
      url.searchParams.set("offset", preData.lastOffset.toString())
    }

    // sorting
    const createdAtSort = sortingState.find((item) => item.id === "createdAt")
    if (createdAtSort) {
      url.searchParams.set("createdAtSort", createdAtSort.desc ? "desc" : "asc")
    }

    return url.toString()
  }

  const { data, isLoading, setSize, mutate } = useSWRInfinite(
    getKey,
    fetchLicenses,
    {
      revalidateOnFocus: false,
    }
  )
  const licenses = useMemo(() => data?.flatMap((d) => d.licenses) ?? [], [data])
  const hadMore = useMemo(
    () => data && data.length > 0 && data[data.length - 1].lastOffset != null,
    [data]
  )

  const handleLoadMore = useCallback(() => {
    void setSize((size) => size + 1)
  }, [setSize])

  const handleRowChange = useCallback(
    async (index: number, row: Partial<License>) => {
      const target = licenses[index]
      const { success } = await updateLcsAction({ key: target.key, ...row })
      // update local data
      if (success) {
        const newData: typeof data = []
        data?.forEach((d, i) => {
          const nd = {
            lastOffset: d.lastOffset,
            licenses: d.licenses.map((l) => {
              if (l.key === target.key) {
                return { ...l, ...row }
              }
              return l
            }),
          }
          newData[i] = nd
        })

        void mutate(newData, {
          revalidate: false,
        })
      }
      return success
    },
    [data, licenses, mutate]
  )

  // refresh when license created
  const handleLcsCreated = useCallback(() => {
    void mutate()
  }, [mutate])

  const handleSearchKey = (key: string) => {
    setSearchKey(key)
  }

  return (
    <div className="flex flex-col space-y-4 h-full">
      <div className="flex justify-between flex-none">
        <div className="flex space-x-6 flex-none">
          <div className="flex items-center space-x-2">
            <Label>App:</Label>
            <AppSelect value={app} onChange={setApp} />
          </div>
          <div className="flex items-center space-x-2">
            <Label>Created From:</Label>
            <DatePicker value={createdAt} onChange={setCreatedAt} />
          </div>
          <KeySearch onSearch={handleSearchKey} />
        </div>
        <div className="flex space-x-8">
          <CreateLicenseDialog onCreated={handleLcsCreated} />
        </div>
      </div>
      <div className="grow">
        <DataTable
          data={licenses}
          columns={columns}
          loadMore={handleLoadMore}
          hadMore={hadMore}
          onRowChange={handleRowChange}
          loading={isLoading}
          sorting={sortingState}
          onSortingChange={setSortingState}
          getRowId={(row) => row.key}
        />
      </div>
    </div>
  )
}

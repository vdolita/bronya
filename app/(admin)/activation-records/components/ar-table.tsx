"use client"

import { updateArAction } from "@/app/_action/act-record"
import AppSelect from "@/app/_components/app-select"
import KeySearch from "@/app/_components/table/key-search"
import { fetchActRecords } from "@/app/_fetcher/act-records"
import { DataTable } from "@/components/data-table"
import DatePicker from "@/components/date-picker"
import { ActivationRecord } from "@/lib/schemas"
import { Label } from "@/sdui/ui/label"
import { SortingState } from "@tanstack/react-table"
import { useCallback, useMemo, useState } from "react"
import useSWRInfinite from "swr/infinite"
import columns from "./columns"

const PAGE_SIZE = 20

type ActExp = {
  activatedAt: Date | undefined
  expireAt: Date | undefined
}

export default function ActRecordsTable() {
  const [app, setApp] = useState<string | undefined>()
  const [searchKey, setSearchKey] = useState<string>("")
  const [actExpAt, setActExpAt] = useState<ActExp>({
    activatedAt: undefined,
    expireAt: undefined,
  })
  const [sortingState, setSortingState] = useState<SortingState>([])

  const getKey = (
    _: number,
    preData: Awaited<ReturnType<typeof fetchActRecords>> | undefined,
  ) => {
    if (!app) return null
    if (preData && !preData.lastOffset) return null

    const url = new URL(
      "/api/admin/activation-records",
      window?.location.origin,
    )
    url.searchParams.set("app", app)
    url.searchParams.set("pageSize", PAGE_SIZE.toString())

    if (searchKey) url.searchParams.set("key", searchKey)

    if (preData?.lastOffset) {
      url.searchParams.set("offset", preData.lastOffset.toString())
    }

    if (actExpAt.activatedAt) {
      url.searchParams.set("activatedAt", actExpAt.activatedAt.toISOString())
    } else if (actExpAt.expireAt) {
      url.searchParams.set("expireAt", actExpAt.expireAt.toISOString())
    }

    // sorting
    const actAtSort = sortingState.find((item) => item.id === "activatedAt")
    const expAtSort = sortingState.find((item) => item.id === "expireAt")

    if (actAtSort) {
      url.searchParams.set("createdAtSort", actAtSort.desc ? "desc" : "asc")
    }

    if (expAtSort) {
      url.searchParams.set("expireAtSort", expAtSort.desc ? "desc" : "asc")
    }

    return url.toString()
  }

  const { data, isLoading, setSize, mutate } = useSWRInfinite(
    getKey,
    fetchActRecords,
    {
      revalidateOnFocus: false,
      revalidateAll: true,
      refreshInterval: 1000 * 60 * 1,
    },
  )

  const actRecords = useMemo(
    () => data?.flatMap((d) => d.actRecords) ?? [],
    [data],
  )

  const hadMore = useMemo(
    () => data && data.length > 0 && data[data.length - 1].lastOffset != null,
    [data],
  )

  const handleLoadMore = useCallback(() => {
    void setSize((size) => size + 1)
  }, [setSize])

  const handleRowChange = useCallback(
    async (index: number, row: Partial<ActivationRecord>) => {
      const { key, identityCode } = actRecords[index]
      const { success } = await updateArAction({
        ...row,
        key,
        identityCode,
      })

      if (success) {
        const newData: typeof data = []
        data?.forEach((d, i) => {
          const nd = {
            lastOffset: d.lastOffset,
            actRecords: d.actRecords.map((l) => {
              if (l.key === key) {
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
    [actRecords, data, mutate],
  )

  const handleSearchKey = (key: string) => {
    setSearchKey(key)
  }

  return (
    <div className="flex flex-col space-y-4 h-full">
      <div className="flex justify-between flex-none">
        <div className="flex space-x-6 flex-none">
          <div className="flex items-center space-x-2">
            <Label>App:</Label>
            <AppSelect value={app} onChange={setApp} type="ar" />
          </div>
          <div className="flex items-center space-x-2">
            <Label>Activated From:</Label>
            <DatePicker
              value={actExpAt.activatedAt}
              onChange={(date) =>
                setActExpAt({ activatedAt: date, expireAt: undefined })
              }
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label>Expire After:</Label>
            <DatePicker
              value={actExpAt.expireAt}
              onChange={(date) =>
                setActExpAt({ activatedAt: undefined, expireAt: date })
              }
            />
          </div>
          <KeySearch onSearch={handleSearchKey} />
        </div>
      </div>
      <div className="grow">
        <DataTable
          data={actRecords}
          columns={columns}
          enableMultiSort={false}
          enableSortingRemoval={true}
          loadMore={handleLoadMore}
          hadMore={hadMore}
          loading={isLoading}
          sorting={sortingState}
          onSortingChange={setSortingState}
          onRowChange={handleRowChange}
          getRowId={(row) => `${row.key}-${row.identityCode}`}
        />
      </div>
    </div>
  )
}

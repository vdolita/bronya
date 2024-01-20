"use client"

import { updateAppAction } from "@/app/_action/app"
import { fetchApp } from "@/app/_fetcher/app"
import { DataTable } from "@/components/data-table"
import { ClientApp } from "@/lib/schemas/app"
import useSwr from "swr"
import columns from "./columns"
import CreateAppDialog from "./create-app-dialog"

export default function AppListTable() {
  const { data, isLoading, mutate } = useSwr("/api/admin/app", fetchApp, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const apps: ClientApp[] = data ?? []

  const handleRowChange = async (index: number, data: Partial<ClientApp>) => {
    const targetApp = apps[index]
    const { success } = await updateAppAction({
      name: targetApp.name,
      version: data.version!,
    })

    if (success) {
      await mutate()
    }
    return success
  }

  return (
    <div className="flex flex-col space-y-4 h-full">
      <div className="self-end">
        <CreateAppDialog />
      </div>
      <div className="grow">
        <DataTable
          data={apps}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => `${row.name}`}
          onRowChange={handleRowChange}
        />
      </div>
    </div>
  )
}

"use client"

import { fetchApp, updateApp } from "@/app/_fetcher/app"
import CreateAppDialog from "@/components/create-app-dialog"
import { DataTable } from "@/components/data-table"
import { ClientApp } from "@/lib/schemas/app"
import useSwr from "swr"
import columns from "./columns"

export default function AppListTable() {
  const { data, isLoading, mutate } = useSwr("/api/admin/app", fetchApp, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const apps: ClientApp[] = data ?? []

  const handleRowChange = async (index: number, data: Partial<ClientApp>) => {
    const targetApp = apps[index]
    const isSuccess = await updateApp("/api/admin/app", {
      name: targetApp.name,
      version: data.version!,
    })

    if (isSuccess) {
      const newApps = apps.map((app) => {
        if (app.name === targetApp.name) {
          return { ...app, ...data }
        }
        return app
      })
      await mutate(newApps, {
        revalidate: false,
      })
    }
    return isSuccess
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

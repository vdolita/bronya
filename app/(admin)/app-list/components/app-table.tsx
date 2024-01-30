"use client"

import { updateAppAction } from "@/app/_action/app"
import { useAppList } from "@/app/_hooks/app"
import { DataTable } from "@/components/data-table"
import { ClientApp } from "@/lib/schemas/app"
import columns from "./columns"
import CreateAppDialog from "./create-app-dialog"

export default function AppListTable() {
  const { data, isLoading, mutate } = useAppList()

  const apps: ClientApp[] = data ?? []

  const handleRowChange = async (index: number, data: Partial<ClientApp>) => {
    const targetApp = apps[index]
    const { success } = await updateAppAction({
      name: targetApp.name,
      version: data.version!,
    })

    if (success) {
      targetApp.version = data.version!
      await mutate()
    }
    return success
  }

  const handleAppCreated = () => {
    void mutate()
  }

  return (
    <div className="flex flex-col space-y-4 h-full">
      <div className="self-end">
        <CreateAppDialog onAppCreated={handleAppCreated} />
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

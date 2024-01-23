import VersionCell from "@/app/_components/table/version-cell"
import { ClientApp } from "@/lib/schemas/app"

import { createColumnHelper } from "@tanstack/react-table"

const columnHelper = createColumnHelper<ClientApp>()

const VersionCol = columnHelper.accessor("version", {
  header: "Version",
  cell: ({ getValue, table, row: { index } }) => {
    const val = getValue()
    const onRowChange = table.options.meta?.onRowChange

    const handleSave = async (value: string) => {
      if (onRowChange) {
        const isSuccess = await onRowChange(index, {
          version: value,
        })
        return isSuccess
      }
      return false
    }

    return <VersionCell key={val} value={val} onSave={handleSave} />
  },
})

export default VersionCol

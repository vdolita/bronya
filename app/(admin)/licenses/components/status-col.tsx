"use client"

import StatusCell from "@/components/status-cell"
import { StatusEnum } from "@/lib/meta"
import { License } from "@/lib/schemas"
import { ColumnDef } from "@tanstack/react-table"

const StatusCol: ColumnDef<License> = {
  accessorKey: "status",
  header: "Status",
  cell: ({ getValue, row: { index }, column: { id }, table }) => {
    const val = getValue<StatusEnum>()
    const onRowChange = table.options.meta?.onRowChange

    const handleChange = async (newVal: StatusEnum) => {
      if (onRowChange) {
        return await onRowChange(index, { [id]: newVal })
      }

      return false
    }

    return <StatusCell value={val} onCheckedChange={handleChange} />
  },
}

export default StatusCol

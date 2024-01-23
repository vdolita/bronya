"use client"

import RemarkCell from "@/app/_components/table/remark-cell"
import { ActivationRecord } from "@/lib/schemas"
import { createColumnHelper } from "@tanstack/react-table"

const columnHelper = createColumnHelper<ActivationRecord>()
const RemarkCol = columnHelper.accessor("remark", {
  header: "Remark",
  cell: ({ getValue, table, row: { index } }) => {
    const val = getValue()
    const onRowChange = table.options.meta?.onRowChange

    const handleSave = async (value: string) => {
      if (onRowChange) {
        const isSuccess = await onRowChange(index, {
          remark: value,
        })
        return isSuccess
      }
      return false
    }

    return <RemarkCell key={val} value={val} onSave={handleSave} />
  },
})

export default RemarkCol

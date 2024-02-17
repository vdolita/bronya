"use client"

import RemarkCell from "@/app/_components/table/remark-cell"
import { usePermit } from "@/app/_hooks/permit"
import { formateAppLcsRsc, permActM } from "@/lib/permit/permission"
import { License } from "@/lib/schemas"
import { createColumnHelper } from "@tanstack/react-table"

const columnHelper = createColumnHelper<License>()
const RemarkCol = columnHelper.accessor("remark", {
  header: "Remark",
  cell: ({
    getValue,
    table,
    row: {
      index,
      original: { app },
    },
  }) => {
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

    return <Remark key={val} value={val} onChange={handleSave} app={app} />
  },
})

interface RemarkProps {
  value: string
  app: string
  onChange: (value: string) => Promise<boolean>
}

const Remark = ({ value, onChange, app }: RemarkProps) => {
  const ableEdit = usePermit(permActM, formateAppLcsRsc(app))

  return <RemarkCell value={value} onSave={onChange} disabled={!ableEdit} />
}

export default RemarkCol

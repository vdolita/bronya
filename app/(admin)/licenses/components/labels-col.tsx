import LabelsBox from "@/components/labels-box"
import { License } from "@/lib/schemas"
import { CellContext, ColumnDef } from "@tanstack/react-table"
import { useCallback, useEffect, useState } from "react"

const LabelsCol: ColumnDef<License> = {
  accessorKey: "labels",
  header: "Labels",
  cell: (props) => <LabelsCell {...props} />,
}

const LabelsCell = ({
  getValue,
  row,
  table,
  column: { id },
}: CellContext<License, unknown>) => {
  const initialValue = getValue<string[]>()
  const index = row.index

  const [value, setValue] = useState(new Set(initialValue))

  const handleLabelsChange = useCallback(
    async (labels: Set<string>) => {
      const onRowChange = table.options.meta?.onRowChange

      if (onRowChange) {
        const isSuccess = await onRowChange(index, {
          [id]: Array.from(labels),
        })
        if (isSuccess) {
          setValue(new Set(labels))
        }
      }
    },
    [index, id, table]
  )

  useEffect(() => {
    setValue(new Set(initialValue))
  }, [initialValue, setValue])

  return (
    <LabelsBox
      onChange={(lbs) => void handleLabelsChange(lbs)}
      className="max-w-40"
      value={value}
    />
  )
}

export default LabelsCol

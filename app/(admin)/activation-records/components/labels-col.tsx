import LabelsCell from "@/components/labels-cell"
import { ActivationRecord } from "@/lib/schemas"
import { createColumnHelper } from "@tanstack/react-table"

const columnHelper = createColumnHelper<ActivationRecord>()
const LabelsCol = columnHelper.accessor("labels", {
  header: "Labels",
  cell: ({ getValue, table, row: { index } }) => {
    const val = getValue()
    const onRowChange = table.options.meta?.onRowChange

    const handleChange = async (labels: string[]) => {
      if (onRowChange) {
        return onRowChange(index, {
          labels,
        })
      }
      return false
    }

    return <LabelsCell value={val} onChange={handleChange} />
  },
})

export default LabelsCol

import LabelsCell from "@/app/_components/table/labels-cell"
import { usePermit } from "@/app/_hooks/permit"
import { formateAppArRsc, permActW } from "@/lib/permit/permission"
import { ActivationRecord } from "@/lib/schemas"
import { createColumnHelper } from "@tanstack/react-table"

const columnHelper = createColumnHelper<ActivationRecord>()
const LabelsCol = columnHelper.accessor("labels", {
  header: "Labels",
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

    const handleChange = async (labels: string[]) => {
      if (onRowChange) {
        return onRowChange(index, {
          labels,
        })
      }
      return false
    }

    return <Labels app={app} value={val} onChange={handleChange} />
  },
})

interface LabelsProps {
  app: string
  value: string[]
  onChange: (labels: string[]) => Promise<boolean>
}

function Labels({ app, value, onChange }: LabelsProps) {
  const ableToEdit = usePermit(permActW, formateAppArRsc(app))

  return <LabelsCell value={value} disabled={!ableToEdit} onChange={onChange} />
}

export default LabelsCol

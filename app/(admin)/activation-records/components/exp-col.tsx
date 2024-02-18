import { usePermit } from "@/app/_hooks/permit"
import DatePicker from "@/components/date-picker"
import SortHeader from "@/components/sort-header"
import { formateAppArRsc, permActW } from "@/lib/permit/permission"
import { ActivationRecord } from "@/lib/schemas"
import { formatDateTime } from "@/lib/utils/time"
import { createColumnHelper } from "@tanstack/react-table"
import { endOfDay } from "date-fns"
import { useState, useTransition } from "react"

const columnHelper = createColumnHelper<ActivationRecord>()

const ExpireAtCol = columnHelper.accessor("expireAt", {
  header: ({ column }) => {
    const { toggleSorting, getIsSorted } = column
    const sort = getIsSorted()

    const handleSortChange = () => {
      toggleSorting()
    }

    return (
      <SortHeader text="Expire At" value={sort} onChange={handleSortChange} />
    )
  },
  cell: ({
    getValue,
    row: {
      index,
      original: { app },
    },
    column: { id },
    table,
  }) => {
    const val = getValue()
    const onRowChange = table.options.meta?.onRowChange

    const handleChange = async (newVal?: Date) => {
      if (onRowChange && newVal) {
        return await onRowChange(index, { [id]: newVal })
      }

      return false
    }

    return (
      <ExpColWrapper
        app={app}
        key={val.toISOString()}
        value={val}
        onChange={handleChange}
      />
    )
  },
})

interface ExpColWrapperProps {
  value: Date
  app: string
  onChange: (newVal?: Date) => Promise<boolean>
}

function ExpColWrapper({ value, app, onChange }: ExpColWrapperProps) {
  const [ctrlVal, setCtrlVal] = useState(value)
  const [isPending, startTransition] = useTransition()
  const isAbleEdit = usePermit(permActW, formateAppArRsc(app))

  const handleChange = (newVal?: Date) => {
    if (!newVal) return

    startTransition(async () => {
      const isSuccess = await onChange(endOfDay(newVal))
      if (isSuccess) {
        setCtrlVal(newVal)
      }
    })
  }

  if (!isAbleEdit) {
    return formatDateTime(value)
  }

  return (
    <DatePicker value={ctrlVal} disabled={isPending} onChange={handleChange} />
  )
}

export default ExpireAtCol

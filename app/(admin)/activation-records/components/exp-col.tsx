import DatePicker from "@/components/date-picker"
import SortHeader from "@/components/sort-header"
import { ActivationRecord } from "@/lib/schemas"
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
  cell: ({ getValue, row: { index }, column: { id }, table }) => {
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
        key={val.toISOString()}
        value={val}
        onChange={handleChange}
      />
    )
  },
})

interface ExpColWrapperProps {
  value: Date
  onChange: (newVal?: Date) => Promise<boolean>
}

function ExpColWrapper({ value, onChange }: ExpColWrapperProps) {
  const [ctrlVal, setCtrlVal] = useState(value)
  const [isPending, startTransition] = useTransition()

  const handleChange = (newVal?: Date) => {
    if (!newVal) return

    startTransition(async () => {
      const isSuccess = await onChange(endOfDay(newVal))
      if (isSuccess) {
        setCtrlVal(newVal)
      }
    })
  }

  return (
    <DatePicker value={ctrlVal} disabled={isPending} onChange={handleChange} />
  )
}

export default ExpireAtCol

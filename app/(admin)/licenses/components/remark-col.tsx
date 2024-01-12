"use client"

import { Remark, remark } from "@/lib/meta"
import { License } from "@/lib/schemas"
import { Button } from "@/sdui/ui/button"
import { Textarea } from "@/sdui/ui/textarea"
import { CellContext, createColumnHelper } from "@tanstack/react-table"
import { ChangeEvent, useState, useTransition } from "react"

const columnHelper = createColumnHelper<License>()
const RemarkCol = columnHelper.accessor("remark", {
  header: "Remark",
  cell: (props) => {
    const { row } = props
    const keyVal = row.original.key

    return <RemarkCell key={keyVal} {...props} />
  },
})

const RemarkCell = ({
  getValue,
  table,
  row,
  column: { id },
}: CellContext<License, unknown>) => {
  const initialValue = getValue<Remark>()
  const index = row.index

  const [value, setValue] = useState(initialValue)
  const [showSave, setShowSave] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const newVal = event.target.value
    const safeVal = remark.safeParse(newVal)

    if (!safeVal.success) {
      return
    }

    setValue(newVal)

    if (newVal != initialValue) {
      setShowSave(true)
    } else {
      setShowSave(false)
    }
  }

  function saveRemark() {
    const onRowChange = table.options.meta?.onRowChange

    if (onRowChange) {
      startTransition(async () => {
        const isSuccess = await onRowChange(index, { [id]: value })
        if (isSuccess) {
          setShowSave(false)
        }
      })
    }
  }

  return (
    <div className="flex flex-col space-y-2 items-end">
      <Textarea value={value} onChange={handleChange} />
      {showSave && (
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={saveRemark}
        >
          save
        </Button>
      )}
    </div>
  )
}

export default RemarkCol

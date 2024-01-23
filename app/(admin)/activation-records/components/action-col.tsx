import { STATUS_ACT, STATUS_DISABLED } from "@/lib/meta"
import { ActivationRecord } from "@/lib/schemas"
import { Button } from "@/sdui/ui/button"
import { CellContext, createColumnHelper } from "@tanstack/react-table"
import { isAfter } from "date-fns"
import { useTransition } from "react"

const colHelper = createColumnHelper<ActivationRecord>()

const ActionCol = colHelper.display({
  id: "actions",
  header: "Actions",
  cell: (props) => <ActionsCell {...props} />,
})

function ActionsCell({ row, table }: CellContext<ActivationRecord, unknown>) {
  const [isPending, startTransition] = useTransition()
  const arStatus = row.original.status

  // if expired or status not act/disabled, disable the button
  const isExpired = isAfter(new Date(), row.original.expireAt)
  const isAbleChange =
    (arStatus === STATUS_ACT || arStatus === STATUS_DISABLED) && !isExpired

  const isDisabled = arStatus === STATUS_DISABLED
  const onRowChange = table.options.meta?.onRowChange
  const handleClick = () => {
    if (onRowChange) {
      startTransition(async () => {
        const newState = isDisabled ? STATUS_ACT : STATUS_DISABLED

        await onRowChange(row.index, { status: newState })
      })
    }
  }

  return (
    <Button
      size="sm"
      variant="destructive"
      disabled={isPending || !isAbleChange}
      onClick={handleClick}
    >
      {isDisabled ? "Enable" : "Disable"}
    </Button>
  )
}

export default ActionCol

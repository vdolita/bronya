import { STATUS_ACT, STATUS_DISABLED } from "@/lib/meta"
import { License } from "@/lib/schemas"
import { Button } from "@/sdui/ui/button"
import { CellContext, createColumnHelper } from "@tanstack/react-table"
import { useTransition } from "react"

const colHelper = createColumnHelper<License>()

const ActionCol = colHelper.display({
  id: "actions",
  header: "Actions",
  cell: (props) => <ActionsCell {...props} />,
})

function ActionsCell({ row, table }: CellContext<License, unknown>) {
  const [isPending, startTransition] = useTransition()

  const isDisabled = row.original.status == STATUS_DISABLED
  const onRowChange = table.options.meta?.onRowChange

  const handleClick = () => {
    if (onRowChange) {
      startTransition(async () => {
        const newState = isDisabled ? STATUS_ACT : STATUS_DISABLED
        await onRowChange(row.index, {
          status: newState,
        })
      })
    }
  }

  return (
    <Button
      size="sm"
      variant="destructive"
      disabled={isPending}
      onClick={handleClick}
    >
      {isDisabled ? "Enable" : "Disable"}
    </Button>
  )
}

export default ActionCol

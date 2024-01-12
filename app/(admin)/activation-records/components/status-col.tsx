import { ActivationRecord } from "@/lib/schemas"
import { createColumnHelper } from "@tanstack/react-table"
import { isAfter } from "date-fns"

const columnHelper = createColumnHelper<ActivationRecord>()

const StatusCol = columnHelper.accessor("status", {
  header: "Status",
  cell: ({ getValue, row: { original: actRecord } }) => {
    const arStatus = getValue()
    const isExpired = isAfter(new Date(), actRecord.expireAt)

    if (isExpired) {
      return `${arStatus} (Expired)`
    }

    return arStatus
  },
})

export default StatusCol

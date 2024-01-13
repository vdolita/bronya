import KeyCell from "@/components/key-cell"
import SortHeader from "@/components/sort-header"
import { ActivationRecord } from "@/lib/schemas"
import { formatDateTime } from "@/lib/utils/time"
import { createColumnHelper } from "@tanstack/react-table"
import ActionCol from "./action-col"
import ExpireAtCol from "./exp-col"
import LabelsCol from "./labels-col"
import RemarkCol from "./remark-col"
import StatusCol from "./status-col"

const columnHelper = createColumnHelper<ActivationRecord>()

const columns = [
  columnHelper.accessor("key", {
    header: "Key",
    cell: ({ getValue }) => <KeyCell value={getValue()} />,
  }),
  columnHelper.accessor("app", {
    header: "App",
  }),
  columnHelper.accessor("identityCode", {
    header: "Identity Code",
  }),
  columnHelper.accessor("rollingCode", {
    header: "Rolling Code",
  }),
  columnHelper.accessor("rollingDays", {
    header: "Rolling Days",
    cell: ({ row }) => {
      const val = row.getValue<number>("rollingDays")
      return val > 0 ? val : "N/A"
    },
  }),
  columnHelper.accessor("lastRollingAt", {
    header: "Last Rolling At",
    cell: ({ getValue }) => {
      const date = getValue()

      if (!date) return "N/A"
      return formatDateTime(date)
    },
  }),
  StatusCol,
  columnHelper.accessor("activatedAt", {
    header: ({ column }) => {
      const { toggleSorting, getIsSorted } = column
      const sort = getIsSorted()

      const handleSortChange = () => {
        toggleSorting()
      }

      return (
        <SortHeader
          text="Activated At"
          value={sort}
          onChange={handleSortChange}
        />
      )
    },
    cell: ({ getValue }) => formatDateTime(getValue()),
  }),
  ExpireAtCol,
  RemarkCol,
  LabelsCol,
  ActionCol,
]

export default columns

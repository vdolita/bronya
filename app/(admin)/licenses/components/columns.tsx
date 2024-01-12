import KeyCell from "@/components/key-cell"
import SortHeader from "@/components/sort-header"
import { License } from "@/lib/schemas"
import { formatDateTime } from "@/lib/utils/time"
import { createColumnHelper } from "@tanstack/react-table"
import ActionCol from "./action-col"
import LabelsCol from "./labels-col"
import RemarkCol from "./remark-col"

const columnHelper = createColumnHelper<License>()

const columns = [
  columnHelper.accessor("key", {
    header: "Key",
    cell: ({ getValue }) => <KeyCell value={getValue()} />,
  }),
  columnHelper.accessor("app", {
    header: "App",
  }),
  columnHelper.accessor("duration", {
    header: "Duration",
  }),
  columnHelper.accessor("totalActCount", {
    header: "Total Act",
  }),
  columnHelper.accessor("balanceActCount", {
    header: "Balance Act",
  }),
  columnHelper.accessor("createdAt", {
    header: ({ column }) => {
      const { toggleSorting, getIsSorted } = column
      const sort = getIsSorted()

      const handleSortChange = () => {
        toggleSorting()
      }

      return (
        <SortHeader
          text="Created At"
          value={sort}
          onChange={handleSortChange}
        />
      )
    },
    cell: ({ getValue }) => formatDateTime(getValue()),
  }),
  columnHelper.accessor("validFrom", {
    header: "Valid From",
    cell: ({ getValue }) => {
      const date = getValue()

      if (!date) return "N/A"
      return formatDateTime(date)
    },
  }),
  columnHelper.accessor("rollingDays", {
    header: "Rolling Days",
    cell: ({ getValue }) => {
      const val = getValue()
      return val > 0 ? val : "N/A"
    },
  }),
  columnHelper.accessor("status", {
    header: "Status",
  }),
  RemarkCol,
  LabelsCol,
  ActionCol,
]

export default columns

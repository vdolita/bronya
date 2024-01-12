import SortHeader from "@/components/sort-header"
import { License } from "@/lib/schemas"
import { formatDateTime } from "@/lib/utils/time"
import { ColumnDef } from "@tanstack/react-table"
import KeyCol from "./key-col"
import LabelsCol from "./labels-col"
import RemarkCol from "./remark-col"
import StatusCol from "./status-col"

const columns: ColumnDef<License>[] = [
  KeyCol,
  {
    accessorKey: "app",
    header: "App",
  },
  {
    accessorKey: "duration",
    header: "Duration",
  },
  {
    accessorKey: "totalActCount",
    header: "Total Act",
  },
  {
    accessorKey: "balanceActCount",
    header: "Balance Act",
  },
  {
    accessorKey: "createdAt",
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
    cell: ({ row }) => {
      const val = row.getValue<Date>("createdAt")
      return formatDateTime(val)
    },
  },
  {
    accessorKey: "validFrom",
    header: "Valid From",
    cell: ({ row }) => {
      const val = row.getValue<Date>("validFrom")
      return formatDateTime(val)
    },
  },
  {
    accessorKey: "rollingDays",
    header: "Rolling Days",
    cell: ({ row }) => {
      const val = row.getValue<number>("rollingDays")
      return val > 0 ? val : "N/A"
    },
  },
  StatusCol,
  RemarkCol,
  LabelsCol,
]

export default columns

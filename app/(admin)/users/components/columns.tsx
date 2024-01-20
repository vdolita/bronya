import { User } from "@/lib/schemas"
import { createColumnHelper } from "@tanstack/react-table"

const columnHelper = createColumnHelper<User>()

const columns = [
  columnHelper.accessor("username", {
    header: "Username",
  }),
  columnHelper.accessor("status", {
    header: "Status",
  }),
]

export default columns

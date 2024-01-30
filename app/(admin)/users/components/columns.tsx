import { User } from "@/lib/schemas"
import { createColumnHelper } from "@tanstack/react-table"
import EditUserDialog from "./edit-user"
import PermsCol from "./perms-col"

const columnHelper = createColumnHelper<User>()

const columns = [
  columnHelper.accessor("username", {
    header: "Username",
  }),
  columnHelper.accessor("status", {
    header: "Status",
  }),
  columnHelper.accessor("perms", {
    header: "Permissions",
    cell: ({ getValue }) => {
      const perms = getValue()
      return <PermsCol permissions={perms} />
    },
  }),
  columnHelper.display({
    header: "Actions",
    cell: ({ row: { original: user } }) => {
      return (
        <div className="flex space-x-2">
          <EditUserDialog user={user} />
        </div>
      )
    },
  }),
]

export default columns

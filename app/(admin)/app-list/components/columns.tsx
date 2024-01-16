import { ClientApp } from "@/lib/schemas/app"
import { createColumnHelper } from "@tanstack/react-table"
import PublicKeyCol from "./pub-key-col"
import VersionCol from "./version-col"

const columnHelper = createColumnHelper<ClientApp>()

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
  }),
  VersionCol,
  columnHelper.accessor("encryptType", {
    header: "Encrypt type",
  }),
  PublicKeyCol,
]

export default columns

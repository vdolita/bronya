import SensitiveText from "@/components/sensitive-text"
import { ClientApp } from "@/lib/schemas/app"
import { createColumnHelper } from "@tanstack/react-table"

const columnHelper = createColumnHelper<ClientApp>()

const PublicKeyCol = columnHelper.accessor("publicKey", {
  header: "Public Key",
  cell: ({ getValue }) => {
    const pubKey = getValue()
    return pubKey == "" ? "" : <SensitiveText text={pubKey} />
  },
})

export default PublicKeyCol

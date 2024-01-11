import KeyCell from "@/components/key-cell";
import { License } from "@/lib/schemas";
import { ColumnDef } from "@tanstack/react-table";

const KeyCol: ColumnDef<License> = {
  accessorKey: "key",
  header: "Key",
  cell: ({ row }) => {
    const val = row.getValue<string>("key");
    return <KeyCell value={val} />;
  },
};

export default KeyCol;

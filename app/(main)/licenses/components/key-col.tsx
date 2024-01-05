import CopyTip from "@/app/components/copy";
import { License } from "@/schemas";
import { ColumnDef } from "@tanstack/react-table";

const KeyCol: ColumnDef<License> = {
  accessorKey: "key",
  header: "Key",
  cell: ({ row }) => {
    const val = row.getValue<string>("key");
    return (
      <div className="flex items-center space-x-1">
        <span>{val}</span>
        <div>
          <CopyTip value={val} />
        </div>
      </div>
    );
  },
};

export default KeyCol;

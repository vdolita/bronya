import { License } from "@/schemas";
import { Textarea } from "@/sdui/ui/textarea";
import { ColumnDef } from "@tanstack/react-table";

const RemarkCol: ColumnDef<License> = {
  accessorKey: "remarks",
  header: "Remarks",
  cell: ({ row }) => {
    const val = row.getValue<string>("remarks");
    return <RemarkCell value={val} />;
  },
};

const RemarkCell = ({ value }: { value: string }) => {
  return <Textarea disabled value={value} />;
};

export default RemarkCol;

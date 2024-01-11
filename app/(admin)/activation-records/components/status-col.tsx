import StatusCell from "@/components/status-cell";
import { StatusEnum } from "@/lib/meta";
import { ActivationRecord } from "@/lib/schemas";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<ActivationRecord>();

const StatusCol = columnHelper.accessor("status", {
  header: "Status",
  cell: ({ getValue, row: { index }, column: { id }, table }) => {
    const val = getValue();
    const onRowChange = table.options.meta?.onRowChange;

    const handleChange = async (newVal: StatusEnum) => {
      if (onRowChange) {
        return await onRowChange(index, { [id]: newVal });
      }

      return false;
    };

    return <StatusCell value={val} onCheckedChange={handleChange} />;
  },
});

export default StatusCol;

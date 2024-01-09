import KeyCell from "@/components/key-cell";
import { ActivationRecord } from "@/schemas";
import { formatDateTime } from "@/utils/time";
import { createColumnHelper } from "@tanstack/react-table";
import statusCol from "./status-col";

const columnHelper = createColumnHelper<ActivationRecord>();

const columns = [
  columnHelper.accessor("key", {
    header: "Key",
    cell: ({ getValue }) => <KeyCell value={getValue()} />,
  }),
  columnHelper.accessor("app", {
    header: "App",
  }),
  columnHelper.accessor("identityCode", {
    header: "Identity Code",
  }),
  columnHelper.accessor("rollingCode", {
    header: "Rolling Code",
  }),
  columnHelper.accessor("rollingDays", {
    header: "Rolling Days",
    cell: ({ getValue }) => getValue() ?? "N/A",
  }),
  columnHelper.accessor("lastRollingAt", {
    header: "Last Rolling At",
    cell: ({ getValue }) => {
      const date = getValue();

      if (!date) return "N/A";
      return formatDateTime(date);
    },
  }),
  statusCol,
  columnHelper.accessor("activatedAt", {
    header: "Activated At",
    cell: ({ getValue }) => formatDateTime(getValue()),
  }),
  columnHelper.accessor("expireAt", {
    header: "Expire At",
    cell: ({ getValue }) => formatDateTime(getValue()),
  }),
];

export default columns;

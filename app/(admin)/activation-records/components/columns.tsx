import { ActivationRecord } from "@/schemas";
import { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<ActivationRecord>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "licenseKey",
    header: "License Key",
  },
  {
    accessorKey: "app",
    header: "App",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
  {
    accessorKey: "activatedAt",
    header: "Activated At",
  },
  {
    accessorKey: "deactivatedAt",
    header: "Deactivated At",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "remark",
    header: "Remark",
  },
];

export default columns;

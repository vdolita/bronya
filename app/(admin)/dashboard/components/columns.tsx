"use client";

import { License } from "@/schemas";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<License>[] = [
  {
    accessorKey: "app",
    header: "App",
  },
  {
    accessorKey: "key",
    header: "key",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
];

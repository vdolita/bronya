"use client";

import {
  ColumnDef,
  RowData,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/sdui/ui/table";

import { License } from "@/schemas";
import { Button } from "@/sdui/ui/button";
import { formatDateTime } from "@/utils/time";
import KeyCol from "./key-col";
import RemarkCol from "./remark-col";
import StatusCol from "./status-col";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    onRowChange?: (index: number, row: Partial<License>) => Promise<boolean>;
  }
}

const columns: ColumnDef<License>[] = [
  KeyCol,
  {
    accessorKey: "app",
    header: "App",
  },
  {
    accessorKey: "duration",
    header: "Duration",
  },
  {
    accessorKey: "totalActCount",
    header: "Total Act",
  },
  {
    accessorKey: "balanceActCount",
    header: "Balance Act",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const val = row.getValue<Date>("createdAt");
      return formatDateTime(val);
    },
  },
  {
    accessorKey: "validFrom",
    header: "Valid From",
    cell: ({ row }) => {
      const val = row.getValue<Date>("validFrom");
      return formatDateTime(val);
    },
  },
  {
    accessorKey: "rollingDays",
    header: "Rolling Days",
    cell: ({ row }) => {
      const val = row.getValue<number>("rollingDays");
      return val > 0 ? val : "N/A";
    },
  },
  StatusCol,
  RemarkCol,
  {
    accessorKey: "labels",
    header: "Labels",
  },
];

interface DataTableProps {
  data: License[];
  loading?: boolean;
  hadMore?: boolean;
  loadMore?: () => void;
  onRowChange?: (index: number, row: Partial<License>) => Promise<boolean>;
}

export function DataTable({
  data,
  loading,
  hadMore,
  loadMore,
  onRowChange,
}: DataTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      onRowChange,
    },
  });

  return (
    <div className="rounded-md border">
      <Table className="table-auto">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="divide-x"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {loading ? "Loading..." : "No Data"}
              </TableCell>
            </TableRow>
          )}
          {table.getRowModel().rows?.length && hadMore ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <Button
                  variant="link"
                  disabled={loading}
                  onClick={() => loadMore?.()}
                >
                  Load More
                </Button>
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}

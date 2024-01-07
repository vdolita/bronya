"use client";

import {
  ColumnDef,
  OnChangeFn,
  RowData,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
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
import { ChevronDownIcon } from "@radix-ui/react-icons";
import KeyCol from "./key-col";
import LabelsCol from "./labels-col";
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
    header: ({ column }) => {
      const { toggleSorting, getIsSorted } = column;
      const isAsc = getIsSorted() === "asc";

      return (
        <div className="flex items-center space-x-1">
          <Button
            className="w-full justify-start p-0 space-x-2 rounded-none"
            variant="ghost"
            onClick={() => toggleSorting(isAsc)}
          >
            <span>Created At</span>
            <ChevronDownIcon className={`${isAsc ? "rotate-180" : ""}`} />
          </Button>
        </div>
      );
    },
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
  LabelsCol,
];

interface DataTableProps {
  data: License[];
  loading?: boolean;
  hadMore?: boolean;
  loadMore?: () => void;
  onRowChange?: (index: number, row: Partial<License>) => Promise<boolean>;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
}

export function DataTable({
  data,
  loading,
  hadMore,
  loadMore,
  onRowChange,
  onSortingChange,
  sorting,
}: DataTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: onSortingChange,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
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

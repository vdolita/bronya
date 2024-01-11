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

import { Button } from "@/sdui/ui/button";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    onRowChange?: (index: number, row: Partial<TData>) => Promise<boolean>;
  }
}

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;

  loading?: boolean;
  hadMore?: boolean;
  loadMore?: () => void;
  onRowChange?: (index: number, row: Partial<TData>) => Promise<boolean>;
}

export function DataTable<TData>({
  data,
  columns,
  loading,
  hadMore,
  loadMore,
  onRowChange,
  onSortingChange,
  sorting,
}: DataTableProps<TData>) {
  const table = useReactTable<TData>({
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
                          header.getContext(),
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

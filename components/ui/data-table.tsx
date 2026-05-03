"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  pageSize?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Tìm kiếm...",
  pageSize = 6,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    initialState: {
      pagination: { pageSize },
    },
    state: {
      sorting,
      columnFilters,
    },
  });

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <div className="space-y-4">
      {/* Search + Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {searchKey && (
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
            onChange={(e) =>
              table.getColumn(searchKey)?.setFilterValue(e.target.value)
            }
            className="w-full sm:max-w-xs"
          />
        )}
        <p className="text-xs text-muted-foreground shrink-0">
          {filteredCount} kết quả
          {totalPages > 1 && ` — Trang ${currentPage}/${totalPages}`}
        </p>
      </div>

      {/* Table */}
      <Table>
        <TableHeader className="bg-secondary">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                Không tìm thấy dữ liệu.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-xs text-muted-foreground">
            Hiển thị {table.getRowModel().rows.length} / {filteredCount} kết quả
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-2 min-w-0 h-8 w-8 rounded-xl"
            >
              <div className="flex -space-x-1 justify-center items-center">
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5 shrink-0" />
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5 shrink-0" />
              </div>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 min-w-0 h-8 w-8 rounded-xl"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground px-1 select-none">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 min-w-0 h-8 w-8 rounded-xl"
            >
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(totalPages - 1)}
              disabled={!table.getCanNextPage()}
              className="p-2 min-w-0 h-8 w-8 rounded-xl"
            >
              <div className="flex -space-x-1 justify-center items-center">
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5 shrink-0" />
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5 shrink-0" />
              </div>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

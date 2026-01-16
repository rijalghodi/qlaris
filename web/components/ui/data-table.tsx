"use client";

import {
  type ColumnDef as TanstackColumnDef,
  flexRender,
  getCoreRowModel,
  type RowData,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "./empty";
import { Checkbox } from "./checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import React, { useEffect } from "react";
import { FolderOpen } from "lucide-react";
import { LoadingOverlay } from "./loading-overlay";

export type ColumnDef<TData extends RowData, TValue = unknown> = TanstackColumnDef<
  TData,
  TValue
> & {
  hideOnMobile?: boolean;
  hidden?: boolean;
};

export type DataTableProps<TData, TValue = unknown> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  emptyState?: ReactNode;
  emptyMessage?: string;
  emptyDescription?: string;
  onRowClick?: (row: TData) => void;
  enableSelectRow?: boolean;
  onRowSelectionIdsChange?: (selectedIds: string[]) => void;
  rowSelectionIds?: string[];
  initialRowSelectionIds?: string[];
};

export function DataTable<TData, TValue>({
  columns,
  data,
  loading,
  emptyState,
  emptyMessage = "No data",
  emptyDescription,
  onRowClick,
  enableSelectRow = false,
  initialRowSelectionIds,
  onRowSelectionIdsChange,
}: DataTableProps<TData, TValue>) {
  const isMobile = useIsMobile();

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const selectColumn: ColumnDef<TData> = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    size: 10,
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };

  const visibleColumns = enableSelectRow ? [selectColumn, ...columns] : columns;

  const table = useReactTable({
    data,
    columns: isMobile
      ? visibleColumns.filter((col) => !col.hideOnMobile && !col.hidden)
      : visibleColumns.filter((col) => !col.hidden),
    getCoreRowModel: getCoreRowModel(),
    enableMultiRowSelection: enableSelectRow,
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection: rowSelection,
    },
    getRowId: (originalRow, idx) => {
      return (originalRow as any).id ?? idx;
    },
  });

  useEffect(() => {
    if (initialRowSelectionIds) {
      setRowSelection(
        initialRowSelectionIds.reduce((acc, id) => {
          acc[id] = true;
          return acc;
        }, {} as RowSelectionState)
      );
    }
  }, [initialRowSelectionIds]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // When internal row selection changes, notify parent
    const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);
    if (onRowSelectionIdsChange) {
      onRowSelectionIdsChange(selectedIds);
    }
  }, [rowSelection, onRowSelectionIdsChange]);

  return (
    <div className="relative flex flex-col gap-4">
      <LoadingOverlay visible={loading} />
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="has-data-[state=open]:bg-muted">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="font-semibold text-sm py-3 px-3"
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        {/* TODO: max height */}
        <TableBody className="">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={() => onRowClick?.(data[row.index] as TData)}
                className={cn(onRowClick && "cursor-pointer", "has-data-[state=open]:bg-muted")}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-2.5 px-3 font-light text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="min-h-40 w-full">
              <TableCell
                colSpan={columns.length}
                className="w-full min-h-40 text-center items-center justify-center"
              >
                <div className="w-full flex flex-col gap-3 items-center justify-center py-10 px-6 h-[300px]">
                  {emptyState ?? (
                    <>
                      <div className="flex items-center justify-center py-12">
                        <Empty>
                          <EmptyHeader>
                            <EmptyMedia>
                              <FolderOpen className="h-5 w-5 text-primary" />
                            </EmptyMedia>
                            <EmptyTitle>{emptyMessage}</EmptyTitle>
                            {emptyDescription && (
                              <EmptyDescription>{emptyDescription}</EmptyDescription>
                            )}
                          </EmptyHeader>
                        </Empty>
                      </div>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

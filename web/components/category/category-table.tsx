"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@/components/ui/data-table";
import type { Category } from "@/services/api-category";

interface CategoryTableProps {
  categories: Category[];
  isLoading?: boolean;
  onDelete?: (category: Category) => void;
  onEdit?: (category: Category) => void;
}

export function CategoryTable({ categories, isLoading, onDelete, onEdit }: CategoryTableProps) {
  const columns: ColumnDef<Category>[] = [
    {
      id: "name",
      header: () => <div className="text-sm font-semibold">Category</div>,
      cell: ({ row }) => {
        const category = row.original;
        return <div className="text-sm font-normal">{category.name}</div>;
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="flex items-center gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => onEdit?.(category)}
            >
              <Pencil className="size-4" />
            </Button>
            <Button variant="ghost-destructive" size="icon" onClick={() => onDelete?.(category)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={categories}
      loading={isLoading}
      emptyMessage="No categories found"
      emptyDescription="Get started by adding your first category"
      onRowClick={(row) => onEdit?.(row)}
    />
  );
}

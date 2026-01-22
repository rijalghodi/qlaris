"use client";

import { Box, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@/components/ui/data-table";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import type { Product } from "@/services/api-product";
import { delimitNumber, formatCurrency } from "@/lib/number";

interface ProductTableProps {
  products: Product[];
  isLoading?: boolean;
  onDelete?: (product: Product) => void;
  onEdit?: (product: Product) => void;
}

export function ProductTable({ products, isLoading, onDelete, onEdit }: ProductTableProps) {
  const columns: ColumnDef<Product>[] = [
    {
      id: "product",
      header: () => <div className="text-sm font-semibold">Product</div>,
      size: 300,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
              {product.image ? (
                <Avatar size="default" className="rounded-md">
                  <AvatarImage src={product.image.url} alt={product.name} />
                </Avatar>
              ) : (
                <Box className="size-4" />
              )}
            </div>
            <span className="text-sm font-normal">{product.name}</span>
          </div>
        );
      },
    },
    {
      id: "price",
      header: () => <div className="text-sm font-semibold">Price</div>,
      cell: ({ row }) => {
        const price = row.original.price;
        return <div className="text-sm font-normal">{formatCurrency(price)}</div>;
      },
    },
    {
      id: "category",
      header: () => <div className="text-sm font-semibold">Category</div>,
      cell: ({ row }) => {
        const category = row.original.category?.name;
        return <div className="text-sm font-normal">{category}</div>;
      },
    },
    {
      id: "qty",
      header: () => <div className="text-sm font-semibold">Qty</div>,
      cell: ({ row }) => {
        const stock = row.original.stockQty;
        return (
          <div className="text-sm font-normal">
            {stock != undefined && stock != null ? formatCurrency(stock) : ""}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={() => onEdit?.(product)}
              title="Edit"
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost-destructive"
              size="icon"
              onClick={() => onDelete?.(product)}
              title="Delete"
            >
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
      data={products}
      loading={isLoading}
      emptyMessage="No products found"
      emptyDescription="Get started by adding your first product"
    />
  );
}

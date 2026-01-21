"use client";

import { useState } from "react";
import { Eye, Pencil, Trash2, Plus, Upload, FileText, Box } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useProducts, type Product } from "@/services/api-product";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import RowsPerPage from "../ui/rows-perpage";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { ROUTES } from "@/lib/routes";
import { delimitNumber } from "@/lib/number";

export function ProductDashboard() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useProducts({ page, pageSize, search });

  const products = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

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
        return <div className="text-sm font-normal">Rp{delimitNumber(price)}</div>;
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
            {stock != undefined && stock != null ? delimitNumber(stock) : ""}
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
              className="text-muted-foreground hover:text-foreground"
              onClick={() => (window.location.href = ROUTES.PRODUCT_EDIT(product.id))}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <Card className="flex flex-col gap-3 w-full">
      {/* Table */}
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          {/* Filters */}
          <div className="flex items-center gap-3">
            {/* TODO: Add Category and Brand dropdown filters */}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={products}
          loading={isLoading}
          emptyMessage="No products found"
          emptyDescription="Get started by adding your first product"
        />
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <RowsPerPage />
        <Pagination page={page} totalPage={totalPages} onPageChange={setPage} />
      </CardFooter>
    </Card>
  );
}

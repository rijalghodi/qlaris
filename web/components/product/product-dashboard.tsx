"use client";

import { useState } from "react";
import { Eye, Pencil, Trash2, Plus, Upload, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useProducts, type Product } from "@/services/api-product";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function ProductDashboard() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useProducts({ page, pageSize, search });

  const products = data?.data || [];
  const totalItems = data?.pagination?.total_items || 0;
  const totalPages = data?.pagination?.last_page || 1;

  const columns: ColumnDef<Product>[] = [
    {
      id: "product",
      header: () => <div className="text-sm font-semibold">Product Name</div>,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
              {product.image ? (
                <Avatar size="sm" className="rounded-md size-8">
                  <AvatarImage src={product.image} alt={product.name} />
                </Avatar>
              ) : (
                <span className="text-base">📦</span>
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
        return <div className="text-sm font-normal">${price.toFixed(0)}</div>;
      },
    },
    {
      id: "qty",
      header: () => <div className="text-sm font-semibold">Qty</div>,
      cell: ({ row }) => {
        const stock = row.original.stockQty;
        return <div className="text-sm font-normal">{stock}</div>;
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
            >
              <Eye className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold leading-none">Products</h1>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Products", href: "/products" },
            ]}
          />
        </div>

        {/* Search and Actions */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="shrink-0 rounded-full">
              <FileText className="size-4 text-destructive" />
            </Button>
            <Button variant="outline" size="icon" className="shrink-0 rounded-full">
              <FileText className="size-4 text-primary" />
            </Button>
            <Button
              variant="default"
              className="bg-orange-500 hover:bg-orange-600 shrink-0 rounded-full"
            >
              <Plus className="size-4" />
              Add Product
            </Button>
            <Button variant="default" className="shrink-0 rounded-full">
              <Upload className="size-4" />
              Import Product
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl shadow-lg overflow-hidden space-y-3 py-4 px-3">
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
        <DataTable
          columns={columns}
          data={products}
          loading={isLoading}
          emptyMessage="No products found"
          emptyDescription="Get started by adding your first product"
        />
        {/* Pagination Footer */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Row Per Page</span>{" "}
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Rows" />
              </SelectTrigger>
              <SelectContent className="w-10">
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>{" "}
            Entries
          </div>
          <Pagination page={page} totalPage={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}

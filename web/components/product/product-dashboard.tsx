"use client";

import { useState } from "react";

import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { useProducts, useDeleteProduct, LIST_PRODUCTS_KEY } from "@/services/api-product";
import RowsPerPage from "../ui/rows-perpage";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { useDebounce } from "@/hooks/use-debounce";
import { ProductTable } from "./product-table";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { dialogs } from "../ui/dialog-manager";
import { toast } from "sonner";
import { buildQueryKeyPredicate } from "@/services/util";
import { useQueryClient } from "@tanstack/react-query";

export function ProductDashboard() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, isFetching } = useProducts({ page, pageSize, search: debouncedSearch });

  const { mutateAsync: deleteProduct } = useDeleteProduct({
    onSuccess: () => {
      toast.success("Product deleted successfully");
    },
    onError: (error) => {
      toast.error(error || "Failed to delete product");
    },
  });

  const products = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const queryClient = useQueryClient();

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
        </div>
      </CardHeader>
      <CardContent className="min-h-[300px]">
        <ProductTable
          products={products}
          isLoading={isLoading || isFetching}
          onEdit={(product) => {
            router.push(ROUTES.PRODUCT_EDIT(product.id));
          }}
          onDelete={(product) => {
            dialogs.openContextDialog({
              modal: "confirm",
              title: "Delete Product",
              description: `Are you sure you want to delete "${product.name}"?`,
              size: "sm",
              innerProps: {
                variant: "destructive",
                confirmLabel: "Delete",
                cancelLabel: "Cancel",
                onConfirm: async () => {
                  const res = await deleteProduct(product.id);
                  return !res.errors;
                },
              },
            });
          }}
        />
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <RowsPerPage />
        <Pagination page={page} totalPage={totalPages} onPageChange={setPage} />
      </CardFooter>
    </Card>
  );
}

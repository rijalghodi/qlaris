"use client";

import { useState } from "react";

import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { useCategories, useDeleteCategory } from "@/services/api-category";
import ItemsPerPage from "../ui/items-perpage";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { useDebounce } from "@/hooks/use-debounce";
import { CategoryTable } from "./category-table";
import { dialogs } from "../ui/dialog-manager";
import { toast } from "sonner";
import { AddCategoryDialog } from "./add-category-dialog";
import { EditCategoryDialog } from "./edit-category-dialog";

export function CategoryDashboard() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, isFetching } = useCategories({
    page,
    pageSize,
    search: debouncedSearch,
  });

  const { mutateAsync: deleteCategory } = useDeleteCategory({
    onSuccess: () => {
      toast.success("Category deleted successfully");
    },
    onError: (error) => {
      toast.error(error || "Failed to delete category");
    },
  });

  const categories = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

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
        <CategoryTable
          categories={categories}
          isLoading={isLoading || isFetching}
          onEdit={(category) => {
            dialogs.openContextDialog({
              modal: "editCategory",
              title: "Edit Category",
              description: "Update the category name",
              size: "sm",
              innerProps: {
                category,
              },
            });
          }}
          onDelete={(category) => {
            dialogs.openContextDialog({
              modal: "confirm",
              title: "Delete Category",
              description: `Are you sure you want to delete "${category.name}"?`,
              size: "sm",
              innerProps: {
                variant: "destructive",
                confirmLabel: "Delete",
                cancelLabel: "Cancel",
                onConfirm: async () => {
                  const res = await deleteCategory(category.id);
                  return !res.errors;
                },
              },
            });
          }}
        />
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <ItemsPerPage
          value={pageSize}
          onChange={setPageSize}
          totalItems={data?.pagination?.total}
        />
        <Pagination page={page} totalPage={totalPages} onPageChange={setPage} />
      </CardFooter>
    </Card>
  );
}

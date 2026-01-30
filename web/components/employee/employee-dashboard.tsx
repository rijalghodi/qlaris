"use client";

import { useState } from "react";

import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { useEmployees, useDeleteEmployee, LIST_EMPLOYEES_KEY } from "@/services/api-employee";
import ItemsPerPage from "../ui/items-perpage";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { useDebounce } from "@/hooks/use-debounce";
import { EmployeeTable } from "./employee-table";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { dialogs } from "../ui/dialog-manager";
import { toast } from "sonner";
import { buildQueryKeyPredicate } from "@/services/util";
import { useQueryClient } from "@tanstack/react-query";

export function EmployeeDashboard() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, isFetching } = useEmployees({ page, pageSize });

  const { mutateAsync: deleteEmployee } = useDeleteEmployee({
    onSuccess: () => {
      toast.success("Employee deleted successfully");
    },
    onError: (error) => {
      toast.error(error || "Failed to delete employee");
    },
  });

  const employees = data?.data || [];
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
        <EmployeeTable
          employees={employees}
          isLoading={isLoading || isFetching}
          onEdit={(employee) => {
            router.push(ROUTES.EMPLOYEE_EDIT(employee.id));
          }}
          onDelete={(employee) => {
            dialogs.openContextDialog({
              modal: "confirm",
              title: "Delete Employee",
              description: `Are you sure you want to delete "${employee.name}"?`,
              size: "sm",
              innerProps: {
                variant: "destructive",
                confirmLabel: "Delete",
                cancelLabel: "Cancel",
                onConfirm: async () => {
                  const res = await deleteEmployee(employee.id);
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

"use client";

import { useState } from "react";

import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import ItemsPerPage from "../ui/items-perpage";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { useTransactions } from "@/services/api-transaction";
import { TransactionTable } from "./transaction-table";
import { useDebounce } from "@/hooks/use-debounce";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export function TransactionDashboard() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 300);
  const router = useRouter();

  // TODO: Add search functionality when API supports it
  const { data, isLoading, isFetching } = useTransactions({
    page,
    pageSize,
    search: debouncedSearch,
  });

  const transactions = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <Card className="flex flex-col gap-3 w-full">
      {/* Table */}
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <Input
            placeholder="Search invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </CardHeader>
      <CardContent className="min-h-[300px]">
        <TransactionTable
          transactions={transactions}
          isLoading={isLoading || isFetching}
          onRowClick={(transaction) => {
            router.push(ROUTES.TRANSACTION_DETAIL(transaction.id));
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

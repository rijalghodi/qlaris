"use client";

import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@/components/ui/data-table";
import { formatCurrency } from "@/lib/number";
import { TransactionRes } from "@/services/api-transaction";
import { format } from "date-fns";

interface TransactionTableProps {
  transactions: TransactionRes[];
  isLoading?: boolean;
}

export function TransactionTable({ transactions, isLoading }: TransactionTableProps) {
  const columns: ColumnDef<TransactionRes>[] = [
    {
      id: "invoice",
      header: () => <div className="text-sm font-semibold">Invoice Number</div>,
      cell: ({ row }) => {
        return (
          <div className="text-sm font-medium">
            {row.original.invoiceNumber ? `#${row.original.invoiceNumber}` : "-"}
          </div>
        );
      },
    },
    {
      id: "paymentMethod",
      header: () => <div className="text-sm font-semibold">Payment Method</div>,
      cell: () => {
        return <div className="text-sm font-normal">Cash</div>;
      },
    },
    {
      id: "paidAt",
      header: () => <div className="text-sm font-semibold">Date</div>,
      cell: ({ row }) => {
        const paidAt = row.original.paidAt;
        return (
          <div className="text-sm font-normal">
            {paidAt ? format(new Date(paidAt), "dd MMM yyyy, HH:mm") : "-"}
          </div>
        );
      },
    },
    {
      id: "totalAmount",
      header: () => <div className="text-sm font-semibold">Total Amount</div>,
      cell: ({ row }) => {
        return (
          <div className="text-sm font-semibold">{formatCurrency(row.original.totalAmount)}</div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={transactions}
      loading={isLoading}
      emptyMessage="No transactions found"
      emptyDescription="Your transaction history will appear here"
    />
  );
}

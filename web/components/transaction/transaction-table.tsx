"use client";

import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@/components/ui/data-table";
import { formatCurrency } from "@/lib/number";
import { TransactionRes } from "@/services/api-transaction";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { Pencil } from "lucide-react";
import { formatDate } from "@/lib/date";

interface TransactionTableProps {
  transactions: TransactionRes[];
  isLoading?: boolean;
  onRowClick?: (row: TransactionRes) => void;
}

export function TransactionTable({ transactions, isLoading, onRowClick }: TransactionTableProps) {
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
      size: 100,
      header: () => <div className="text-sm font-semibold">Date</div>,
      cell: ({ row }) => {
        const paidAt = row.original.paidAt;
        return (
          <div className="text-sm font-normal">
            {paidAt ? formatDate(paidAt, { withTime: true }) : "-"}
          </div>
        );
      },
    },
    {
      id: "totalAmount",
      size: 100,
      header: () => <div className="text-sm font-semibold">Total Amount</div>,
      cell: ({ row }) => {
        return (
          <div className="text-sm font-semibold">{formatCurrency(row.original.totalAmount)}</div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      size: 50,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={() => onRowClick?.(product)}
              title="Detail"
            >
              <Pencil className="size-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={transactions}
      loading={isLoading}
      onRowClick={(row) => {
        onRowClick?.(row);
      }}
      emptyMessage="No transactions found"
      emptyDescription="Your transaction history will appear here"
    />
  );
}

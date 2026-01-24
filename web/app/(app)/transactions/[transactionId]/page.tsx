"use client";

import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/number";
import { ROUTES } from "@/lib/routes";
import { useTransaction } from "@/services/api-transaction";
import { format } from "date-fns";
import { ArrowLeft, Box, Download, Plane, Printer, Send, Undo2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date";

export default function TransactionDetailPage() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const { data, isLoading, error } = useTransaction(transactionId);
  const transaction = data?.data;

  if (isLoading) {
    return (
      <div className="container mx-auto py-5 px-4 sm:px-6 max-w-7xl animate-pulse">
        <div className="h-8 w-48 bg-muted rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-muted rounded" />
          <div className="h-96 bg-muted rounded col-span-2" />
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="container mx-auto py-5 px-4 sm:px-6 max-w-7xl">
        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
          <p>Error loading transaction: {error?.message || "Transaction not found"}</p>
          <Button asChild variant="link" className="mt-4">
            <Link href={ROUTES.TRANSACTIONS}>Back to Transactions</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-5 px-4 sm:px-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold leading-none">Detail Transaction</h1>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: ROUTES.DASHBOARD },
              { label: "Transactions", href: ROUTES.TRANSACTIONS },
              {
                label: transaction.invoiceNumber
                  ? `#${transaction.invoiceNumber}`
                  : "Detail Transaction",
                href: ROUTES.TRANSACTION_DETAIL(transactionId),
              },
            ]}
          />
        </div>

        <Button asChild variant="secondary" className="shrink-0 rounded-full w-fit">
          <Link href={ROUTES.TRANSACTIONS}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Transactions
          </Link>
        </Button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
        <Card className="max-w-lg">
          <CardHeader className="border-b flex justify-between items-center gap-2 flex-wrap">
            <CardTitle className="text-lg">
              {transaction.invoiceNumber ? `#${transaction.invoiceNumber}` : "Transaction"}
            </CardTitle>
            <CardAction className="flex justify-end gap-2 flex-wrap">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => alert("Refund feature implementation coming soon")}
              >
                <Undo2 /> Refund
              </Button>
              <Button
                variant="default"
                className="flex-1"
                onClick={() => alert("Receipt printing implementation coming soon")}
              >
                <Download /> Download
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Invoice No.</span>
              <span className="font-medium">#{transaction.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment</span>
              <span className="font-medium">Cash</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cashier</span>
              <span className="font-medium">{transaction.creatorName || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">
                {transaction.createdAt
                  ? formatDate(new Date(transaction.createdAt), {
                      withTime: true,
                      humanReadable: false,
                    })
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium capitalize">{transaction.status}</span>
            </div>
          </CardContent>
          <div className="border-b border-dashed" />
          <CardHeader>
            <CardTitle className="text-base font-medium">Details</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto flex flex-col gap-4">
            {transaction.items.map((item) => (
              <div key={item.id} className={cn("flex items-start gap-4 rounded-xl bg-card")}>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-1">{item.productName}</h4>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.price)} x {item.quantity}
                    </p>
                    <p className="font-medium text-sm">{formatCurrency(item.subtotal)}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="block border-t border-dashed">
            <div className="bg-muted/20 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sub Total</span>
                <span className="font-medium">{formatCurrency(transaction.totalAmount)}</span>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(transaction.totalAmount)}</span>
              </div>
            </div>
          </CardFooter>
          <CardFooter className="block border-t border-dashed">
            <div className="bg-muted/20 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Paid Money</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(transaction.receivedAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Change</span>
                <span className="font-medium">{formatCurrency(transaction.changeAmount)}</span>
              </div>
            </div>
          </CardFooter>
        </Card>
        {/* <Card>
          <CardFooter className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => alert("Refund feature implementation coming soon")}
            >
              <Undo2 /> Refund
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onClick={() => alert("Receipt printing implementation coming soon")}
            >
              <Send /> Send Receipt
            </Button>
          </CardFooter>
        </Card> */}
      </div>
    </div>
  );
}

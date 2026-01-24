"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/date";
import { formatCurrency } from "@/lib/number";
import { ROUTES } from "@/lib/routes";
import { useTransaction } from "@/services/api-transaction";
import { Check } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function SuccessTransactionPage() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const { data: transactionResponse, isLoading } = useTransaction(transactionId);
  const transaction = transactionResponse?.data;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Transaction not found</p>
        <Button asChild variant="link">
          <Link href={ROUTES.NEW_TRANSACTION}>Back to Order</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex h-full max-w-[1600px] flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg animate-in gap-8 fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="flex w-full flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-success/10 p-3 text-success">
            <Check className="size-6" strokeWidth={3} />
          </div>

          <h2 className="mb-1 text-xl font-semibold tracking-tight text-success">
            Transaction Succeed
          </h2>

          <p className="text-sm text-muted-foreground">
            {transaction.createdAt
              ? formatDate(transaction.createdAt, { withTime: true, humanReadable: false })
              : "-"}
          </p>
        </CardHeader>
        <CardContent className="text-sm">
          <div className="flex flex-col gap-2 rounded-lg bg-muted p-4">
            <div className="flex w-full justify-between text-sm">
              <span className="text-muted-foreground">Invoice No.</span>
              <span className="font-medium">#{transaction.invoiceNumber}</span>
            </div>
            <div className="flex w-full justify-between text-sm">
              <span className="text-muted-foreground">Payment</span>
              <span className="font-medium">Cash</span>
            </div>
            <div className="flex w-full justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">{formatCurrency(transaction.totalAmount)}</span>
            </div>
            <div className="flex w-full justify-between text-sm">
              <span className="text-muted-foreground">Received</span>
              <span className="font-medium">{formatCurrency(transaction.receivedAmount)}</span>
            </div>
            <div className="mt-1 flex w-full justify-between border-t pt-2 text-sm">
              <span className="text-muted-foreground">Change</span>
              <span className="font-bold text-success">
                {formatCurrency(transaction.changeAmount)}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex w-full gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-full"
            onClick={() => window.print()}
            size="lg"
          >
            Download Invoice
          </Button>
          <Button asChild variant="default" className="flex-1 rounded-full" size="lg">
            <Link href={ROUTES.NEW_TRANSACTION}>New Transaction</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

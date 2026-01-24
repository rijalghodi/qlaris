import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { type TransactionRes } from "@/services/api-transaction";
import { formatCurrency } from "@/lib/number";
import { Badge } from "../ui/badge";
import { ArrowRight, ArrowRightLeft, ChevronRight, Dot, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { formatDate } from "@/lib/date";
import { EmptyState } from "../ui/empty";

type Props = {
  transactions: TransactionRes[];
};

export function LastTransactionsCard({ transactions }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 justify-between">
        <h2 className="font-semibold text-lg">Latest Transactions</h2>
        <Button variant="link" size="default" asChild>
          <Link href={ROUTES.TRANSACTIONS}>
            View All
            <ChevronRight />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-0">
        {transactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Once you make a sale, it will appear here."
            icon={<File className="size-6 text-muted-foreground" />}
          />
        ) : (
          transactions.map((transaction, index) => (
            <LastTransactionCard key={transaction.id} transaction={transaction} />
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function LastTransactionCard({
  transaction,
  className,
}: {
  transaction: TransactionRes;
  className?: string;
}) {
  return (
    <div className={cn("p-4 border-b last:border-0", className)}>
      <div className="flex items-center gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-base truncate">#{transaction.invoiceNumber}</p>
                <Badge variant={transaction.status === "paid" ? "default" : "destructive"}>
                  {transaction.status?.toUpperCase()}
                </Badge>
              </div>
              <p className="inline-flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                <span className="text-sm text-primary font-medium mt-1">
                  {transaction.items.length} item(s)
                </span>
                <Dot className="size-4 inline" />
                <span>{formatDate(transaction.createdAt, { withTime: true })}</span>
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-semibold text-lg tracking-tight">
                {formatCurrency(transaction.totalAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

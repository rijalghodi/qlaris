import { delimitNumber, formatCurrency } from "@/lib/number";
import { TransactionRes } from "@/services/api-transaction";
import { format } from "date-fns";
import { Check, Printer, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date";

interface PaymentSuccessDisplayProps {
  transaction: TransactionRes;
  onNewTransaction: () => void;
}

export function PaymentSuccessDisplay({
  transaction,
  onNewTransaction,
}: PaymentSuccessDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center text-center w-full">
        <div className="bg-success/10 text-success rounded-full p-3 mb-4">
          <Check className="size-6" strokeWidth={3} />
        </div>

        <h2 className="text-xl font-semibold mb-1 tracking-tight text-success">
          Transaction Succeed
        </h2>

        <p className="text-muted-foreground mb-6 text-sm">{formatDate(transaction.createdAt)}</p>

        <div className="w-full space-y-3 bg-muted p-4 rounded-lg text-sm">
          <div className="flex justify-between w-full text-sm">
            <span className="text-muted-foreground">Invoice Number</span>
            <span className="font-medium">#{transaction.invoiceNumber}</span>
          </div>
          <div className="flex justify-between w-full text-sm">
            <span className="text-muted-foreground">Payment Method</span>
            <span className="font-medium">Cash</span>
          </div>
          <div className="flex justify-between w-full text-sm">
            <span className="text-muted-foreground">Total Charge</span>
            <span className="font-semibold">{formatCurrency(transaction.totalAmount)}</span>
          </div>
          <div className="flex justify-between w-full text-sm">
            <span className="text-muted-foreground">Received Amount</span>
            <span className="font-medium">{formatCurrency(transaction.receivedAmount)}</span>
          </div>
          <div className="flex justify-between w-full text-sm border-t pt-2 mt-1">
            <span className="text-muted-foreground">Change</span>
            <span className="font-bold text-success">
              {formatCurrency(transaction.changeAmount)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 w-full mt-6">
        <Button variant="outline" className="flex-1" onClick={() => window.print()}>
          Print Struck
        </Button>
        <Button variant="default" className="flex-1" onClick={onNewTransaction}>
          New Transaction
        </Button>
      </div>
    </div>
  );
}

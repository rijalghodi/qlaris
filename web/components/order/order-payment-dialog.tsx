"use client";

import { useOrderStore } from "@/lib/stores/order-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { delimitNumber, getSuggestionMoneys } from "@/lib/number";
import { useEffect, useState } from "react";
import { NumberInput } from "../ui/number-input";
import { ArrowRight, Loader2 } from "lucide-react";
import { useCreateTransaction } from "@/services/api-transaction";
import { toast } from "sonner";

interface OrderPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderPaymentDialog({ open, onOpenChange }: OrderPaymentDialogProps) {
  const { items, getTotal, clearItems } = useOrderStore();
  const [receivedMoney, setReceivedMoney] = useState<number | undefined>(undefined);

  const total = getTotal();

  const { mutate: createTransaction, isPending } = useCreateTransaction({
    onSuccess: () => {
      toast.success("Payment successful");
      clearItems();
      onOpenChange(false);
      setReceivedMoney(undefined);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleSubmit = () => {
    const finalReceivedAmount = receivedMoney === undefined ? total : receivedMoney;

    if (finalReceivedAmount < total) {
      toast.error("Insufficient amount");
      return;
    }

    createTransaction({
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      receivedAmount: finalReceivedAmount,
      isCashPaid: true,
    });
  };

  useEffect(() => {
    if (open) {
      setReceivedMoney(undefined);
    }
  }, [open]);

  // If input is empty, we treat it as "Enough Money" (exact payment)
  const isInputEmpty = receivedMoney === undefined || receivedMoney === 0;
  const change = isInputEmpty ? 0 : Math.max(0, receivedMoney! - total);

  const suggestions = getSuggestionMoneys(total);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Total Display */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Total Charge</p>
            <p className="text-3xl font-bold text-primary">Rp{delimitNumber(total)}</p>
          </div>

          {/* Money Input */}
          <div className="space-y-3">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Money Received</label>
              <NumberInput
                value={receivedMoney}
                onChange={(val) => setReceivedMoney(val)}
                withDelimiter
                hideControls
                className="h-10 font-medium"
                placeholder="Enter amount"
                min={0}
              />
            </div>

            {/* Submit Button */}
            <Button size="lg" className="w-full" onClick={handleSubmit} disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : isInputEmpty ? (
                "Pay Exact"
              ) : (
                <>
                  Process Payment
                  <ArrowRight className="ml-2 size-4" />
                </>
              )}
            </Button>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <>
                <p className="text-xs font-bold text-foreground">Suggestions:</p>
                <div className="grid grid-cols-2 gap-2">
                  {suggestions.map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      onClick={() => setReceivedMoney(suggestion)}
                      className="h-14 py-2 flex flex-col gap-1 hover:bg-primary/10 hover:text-primary hover:border-primary shadow-none"
                    >
                      <span className="font-medium">Rp{delimitNumber(suggestion)}</span>
                    </Button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Change Display (only if input provided) */}
          {/* {!isInputEmpty && (
            <div className="bg-muted/50 p-3 rounded-lg flex justify-between items-center transition-all animate-in fade-in slide-in-from-top-2">
              <span className="text-sm text-muted-foreground">Change</span>
              <span
                className={`font-semibold ${change < 0 ? "text-destructive" : "text-green-600"}`}
              >
                Rp{delimitNumber(change)}
              </span>
            </div>
          )} */}
        </div>
      </DialogContent>
    </Dialog>
  );
}

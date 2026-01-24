"use client";

import { useOrderStore } from "@/lib/stores/order-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { delimitNumber, formatCurrency, getSuggestionMoneys } from "@/lib/number";
import { useEffect, useState } from "react";
import { NumberInput } from "../ui/number-input";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { TransactionRes, useCreateTransaction } from "@/services/api-transaction";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

interface OrderPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderPaymentDialog({ open, onOpenChange }: OrderPaymentDialogProps) {
  const { items, getTotal, clearItems } = useOrderStore();
  const [receivedMoney, setReceivedMoney] = useState<number | undefined>(undefined);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const total = getTotal();

  const { mutate: createTransaction, isPending } = useCreateTransaction({
    onSuccess: (response) => {
      // toast.success("Payment successful"); // Commented out to avoid double feedback
      if (response?.data?.id) {
        setShowSuccess(true);
        setTimeout(() => {
          onOpenChange(false);
          router.push(ROUTES.ORDER_SUCCESS(response.data?.id as string));
          setShowSuccess(false);
          setReceivedMoney(undefined);
          clearItems();
        }, 500);
      } else {
        // Fallback if no data
        setReceivedMoney(undefined);
        clearItems();
      }
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
      setShowSuccess(false);
    }
  }, [open]);

  // If input is empty, we treat it as "Enough Money" (exact payment)
  const isInputEmpty = receivedMoney === undefined || receivedMoney === 0;
  const isInsufficient = receivedMoney !== undefined && receivedMoney < total;

  const suggestions = getSuggestionMoneys(total);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 animate-in fade-in zoom-in duration-300">
            <div className="bg-success/10 text-success rounded-full p-4 mb-4">
              <Check className="size-12" strokeWidth={3} />
            </div>
            <h2 className="text-xl font-semibold text-success tracking-tight">
              Transaction Success
            </h2>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Payment</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Total Display */}
              <div className="text-center space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Total Charge</p>
                <p className="text-3xl font-bold text-primary tracking-tight">
                  {formatCurrency(total)}
                </p>
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
                <Button
                  size="lg"
                  className="w-full rounded-full"
                  onClick={handleSubmit}
                  disabled={isPending || isInsufficient}
                >
                  {isPending ? (
                    <Spinner className="mr-2 size-4 animate-spin" />
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
                    <p className="text-xs font-semibold text-foreground">Suggestions:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {suggestions.map((suggestion) => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          onClick={() => setReceivedMoney(suggestion)}
                          className="h-12 py-2 flex flex-col gap-1 hover:bg-primary/10 hover:text-primary hover:border-primary shadow-none"
                        >
                          <span className="font-medium">{formatCurrency(suggestion)}</span>
                        </Button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

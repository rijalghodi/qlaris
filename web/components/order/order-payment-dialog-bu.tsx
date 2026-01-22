"use client";

import { useOrderStore } from "@/lib/stores/order-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Banknote, QrCode, CheckCircle2, ArrowRight, ShoppingBag } from "lucide-react";
import { delimitNumber, formatCurrency } from "@/lib/number";
import { useState } from "react";
import { NumberInput } from "../ui/number-input";

type PaymentMethod = "cash" | "qris";
type PaymentStep = "method" | "form" | "success";

interface PaymentMethodStepProps {
  onNext: (method: PaymentMethod) => void;
}

interface PaymentFormStepProps {
  method: PaymentMethod;
  total: number;
  onBack: () => void;
  onSuccess: (receivedMoney: number) => void;
}

interface PaymentSuccessStepProps {
  method: PaymentMethod;
  total: number;
  receivedMoney: number;
  change: number;
  items: any[];
  onClose: () => void;
}

function PaymentMethodStep({ onNext }: PaymentMethodStepProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("cash");

  return (
    <div key="method" className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
      <DialogHeader>
        <DialogTitle className="text-2xl">Select Payment Method</DialogTitle>
      </DialogHeader>

      <div className="space-y-3">
        {/* Cash Option */}
        <button
          onClick={() => setSelectedMethod("cash")}
          className={`w-full p-4 rounded-lg border-2 transition-all ${
            selectedMethod === "cash"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-full ${
                selectedMethod === "cash"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Banknote className="size-6" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-lg">Cash</h3>
              <p className="text-sm text-muted-foreground">Pay with physical cash</p>
            </div>
            <div
              className={`size-6 rounded-full border-2 flex items-center justify-center ${
                selectedMethod === "cash" ? "border-primary bg-primary" : "border-border"
              }`}
            >
              {selectedMethod === "cash" && (
                <div className="size-3 rounded-full bg-primary-foreground" />
              )}
            </div>
          </div>
        </button>

        {/* QRIS Option (Coming Soon) */}
        <button
          disabled
          className="w-full p-4 rounded-lg border-2 border-border opacity-50 cursor-not-allowed"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-muted text-muted-foreground">
              <QrCode className="size-6" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-lg">QRIS</h3>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>
            <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-muted rounded">
              Soon
            </span>
          </div>
        </button>
      </div>

      <Button onClick={() => onNext(selectedMethod)} className="w-full" size="lg">
        Next
        <ArrowRight className="size-4 ml-2" />
      </Button>
    </div>
  );
}

function PaymentFormStep({ method, total, onBack, onSuccess }: PaymentFormStepProps) {
  const [receivedMoney, setReceivedMoney] = useState<number>(0);
  const change = Math.max(0, receivedMoney - total);

  const handleSubmit = () => {
    if (receivedMoney >= total) {
      onSuccess(receivedMoney);
    }
  };

  return (
    <div key="form" className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
      <DialogHeader>
        <DialogTitle className="text-2xl">Payment Details</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Total Amount */}
        <div className="p-4 rounded-lg bg-muted">
          <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
          <p className="text-3xl font-bold text-primary">{formatCurrency(total)}</p>
        </div>

        {/* Received Money Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Received Money</label>
          <NumberInput
            value={receivedMoney}
            onChange={(value) => setReceivedMoney(value || 0)}
            withDelimiter
            hideControls
            min={0}
            className="w-full h-14"
            inputClassName="text-xl font-semibold"
            placeholder="0"
          />
        </div>

        {/* Change Display */}
        {receivedMoney > 0 && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground mb-1">Change</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(change)}</p>
          </div>
        )}

        {/* Warning if insufficient */}
        {receivedMoney > 0 && receivedMoney < total && (
          <p className="text-sm text-destructive">
            Insufficient amount. Please enter at least {formatCurrency(total)}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Button onClick={onBack} variant="outline" className="flex-1" size="lg">
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={receivedMoney < total}
          className="flex-1"
          size="lg"
        >
          Complete Payment
          <ArrowRight className="size-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function PaymentSuccessStep({
  method,
  total,
  receivedMoney,
  change,
  items,
  onClose,
}: PaymentSuccessStepProps) {
  return (
    <div key="success" className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
      <div className="flex flex-col items-center text-center py-4">
        <div className="size-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
          <CheckCircle2 className="size-10 text-green-600 dark:text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
        <p className="text-muted-foreground">The order has been completed successfully</p>
      </div>

      {/* Order Summary */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Order Details</h3>

        {/* Items List */}
        <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
          {items.map((item) => (
            <div key={item.product.id} className="p-3 flex justify-between">
              <div className="flex-1">
                <p className="font-medium">{item.product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(item.quantity)} × {formatCurrency(item.product.price)}
                </p>
              </div>
              <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
            </div>
          ))}
        </div>

        {/* Payment Details */}
        <div className="p-4 rounded-lg bg-muted space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Method</span>
            <span className="font-medium capitalize">{method}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-primary">{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Received</span>
            <span className="font-medium">{formatCurrency(receivedMoney)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Change</span>
            <span className="font-medium">{formatCurrency(change)}</span>
          </div>
        </div>
      </div>

      <Button onClick={onClose} className="w-full" size="lg">
        Done
      </Button>
    </div>
  );
}

interface OrderPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderPaymentDialog({ open, onOpenChange }: OrderPaymentDialogProps) {
  const { items, getTotal, clearItems } = useOrderStore();
  const [step, setStep] = useState<PaymentStep>("method");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("cash");
  const [receivedMoney, setReceivedMoney] = useState<number>(0);

  const total = getTotal();

  const handleMethodNext = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setStep("form");
  };

  const handleFormBack = () => {
    setStep("method");
  };

  const handleFormSuccess = (money: number) => {
    setReceivedMoney(money);
    setStep("success");
  };

  const handleClose = () => {
    // Reset state
    setStep("method");
    setSelectedMethod("cash");
    setReceivedMoney(0);

    // Clear order items
    clearItems();

    // Close dialog
    onOpenChange(false);
  };

  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset state when dialog is closed
      setStep("method");
      setSelectedMethod("cash");
      setReceivedMoney(0);
    }
    onOpenChange(isOpen);
  };

  const change = Math.max(0, receivedMoney - total);

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden">
        <div className="relative">
          {step === "method" && <PaymentMethodStep onNext={handleMethodNext} />}
          {step === "form" && (
            <PaymentFormStep
              method={selectedMethod}
              total={total}
              onBack={handleFormBack}
              onSuccess={handleFormSuccess}
            />
          )}
          {step === "success" && (
            <PaymentSuccessStep
              method={selectedMethod}
              total={total}
              receivedMoney={receivedMoney}
              change={change}
              items={items}
              onClose={handleClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

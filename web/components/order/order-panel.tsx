"use client";

import { useOrderStore } from "@/lib/stores/order-store";
import { Button } from "../ui/button";
import { ShoppingCart, Trash2, Box, ArrowRight } from "lucide-react";
import { delimitNumber } from "@/lib/number";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { IOrderItem } from "@/lib/stores/order-store";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";
import { cn } from "@/lib/utils";
import { OrderPaymentDialog } from "./order-payment-dialog";
import { useState } from "react";

export function OrderPanel() {
  const { items, getTotal, getProductCount, clearItems } = useOrderStore();
  const total = getTotal();
  const productCount = getProductCount();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  return (
    <>
      <Card className="h-full">
        {/* Header */}
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold leading-none">Order Details</h2>
            <span className="text-sm text-foreground font-medium">{productCount} Products</span>
            {/* <span className="text-sm text-foreground font-medium">{itemCount} Items</span> */}
          </div>
        </CardHeader>

        {/* Cart Items */}
        <CardContent className="flex-1 px-3 overflow-y-auto flex flex-col">
          {items.length === 0 ? (
            <OrderEmpty />
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <OrderItem item={item} key={item.product.id} />
              ))}
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <CardFooter className="block border-t space-y-3">
          {/* Total */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Sub Total</span>
              <span>Rp{delimitNumber(total)}</span>
            </div>
            <div className="flex items-center justify-between font-semibold text-lg">
              <span>Total</span>
              <span>Rp{delimitNumber(total)}</span>
            </div>
          </div>

          {/* Grand Total Button */}
          <div className="flex gap-2">
            <Button
              variant="light-destructive"
              size="lg"
              disabled={items.length === 0}
              className="w-24 rounded-full"
              onClick={() => clearItems()}
            >
              Clear
            </Button>
            <Button
              variant="default"
              size="lg"
              disabled={items.length === 0}
              className="flex-1 rounded-full"
              onClick={() => setPaymentDialogOpen(true)}
            >
              Charge Rp{delimitNumber(total)} <ArrowRight />
            </Button>
          </div>
        </CardFooter>
      </Card>
      <OrderPaymentDialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen} />
    </>
  );
}

export function OrderItem({ item, className }: { item: IOrderItem; className?: string }) {
  const { removeItem, setSelectedOrderItem } = useOrderStore();

  return (
    <div
      key={item.product.id}
      className={cn(
        "flex items-start gap-4 p-2 rounded-md hover:bg-accent/50 transition-colors",
        "animate-in fade-in slide-in-from-bottom-4 ease-in duration-300 cursor-pointer",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedOrderItem(item);
      }}
    >
      {/* Product Image */}
      <div className="aspect-square w-12 bg-accent flex items-center justify-center relative overflow-hidden rounded-[8px]">
        {item.product.image ? (
          <Image
            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300 shadow-lg"
            src={item.product.image.url}
            alt={item.product.name}
            fill
          />
        ) : (
          <Box className="size-5 text-muted-foreground group-hover:scale-110 transition-all duration-300" />
        )}
      </div>

      {/* Product Details */}
      {/* <div className="flex-1 min-w-0">
        <h4 className="text-base font-semibold line-clamp-1">{item.product.name}</h4>
        <div className="flex items-end gap-2 justify-between">
          <p className="text-sm text-muted-foreground">{item.quantity}x</p>
          <p className="text-sm font-medium text-muted-foreground">
            Rp{delimitNumber(item.product.price)}
          </p>
        </div>
      </div> */}

      <div className="flex-1 min-w-0 space-y-1">
        <h4 className="text-base font-medium line-clamp-1">
          {item.product.name}
          <span className="text-sm text-muted-foreground ml-2">
            {item.quantity}
            {item.product.unit ? " " + item.product.unit : "x"}
          </span>
        </h4>
        <p className="text-sm font-medium text-muted-foreground flex gap-2 justify-between items-end">
          <span className="text-muted-foreground text-xs leading-none">
            @ Rp{delimitNumber(item.product.price)}
          </span>
          <span className="font-semibold text-foreground leading-none">
            Rp{delimitNumber(item.subtotal)}
          </span>
        </p>
      </div>

      {/* Quantity Controls */}
      {/* <div className="flex items-center gap-0.5 shrink-0">
        <Button
          variant="outline"
          size="icon-sm"
          className="rounded-full"
          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
        >
          <Minus className="size-3" />
        </Button>
        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
        <Button
          variant="outline"
          size="icon-sm"
          className="rounded-full"
          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
        >
          <Plus className="size-3" />
        </Button>
      </div> */}

      {/* Remove Button */}
      <Button
        variant="light-destructive"
        size="icon"
        className="rounded-full"
        onClick={(e) => {
          e.stopPropagation();
          removeItem(item.product.id);
        }}
      >
        <Trash2 />
      </Button>
    </div>
  );
}

export function OrderEmpty() {
  return (
    <Empty className="flex-1 h-full animate-in fade-in slide-in-from-bottom-4 ease-in duration-300">
      <EmptyHeader>
        <EmptyMedia>
          <ShoppingCart className="size-10 text-muted-foreground mb-4" />
        </EmptyMedia>
        <EmptyTitle>No Products Selected</EmptyTitle>
        <EmptyDescription>Add products to start creating an order</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

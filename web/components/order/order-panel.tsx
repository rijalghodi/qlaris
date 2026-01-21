"use client";

import { useOrderStore } from "@/lib/stores/order-store";
import { Button } from "../ui/button";
import { ShoppingCart, Trash2, Minus, Plus } from "lucide-react";
import { delimitNumber } from "@/lib/number";
import { Avatar, AvatarImage } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import Image from "next/image";

export function OrderPanel() {
  const { items, removeItem, updateQuantity, clearItems, getTotal, getItemCount } = useOrderStore();
  const total = getTotal();
  const itemCount = getItemCount();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Order Details</h2>
          <span className="text-sm text-muted-foreground">Items: {itemCount}</span>
        </div>
      </div>

      {/* Cart Items */}
      <ScrollArea className="flex-1 p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Image
              src="/images/empty-cart.svg"
              alt="Empty cart"
              width={200}
              height={200}
              className="mb-4 opacity-50"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <ShoppingCart className="size-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No Products Selected</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add products from the left to start creating an order
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                {/* Product Image */}
                <div className="size-12 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                  {item.product.image ? (
                    <Avatar className="size-full rounded-md">
                      <AvatarImage
                        src={item.product.image.url}
                        alt={item.product.name}
                        className="object-cover"
                      />
                    </Avatar>
                  ) : (
                    <ShoppingCart className="size-6 text-muted-foreground" />
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium line-clamp-1">{item.product.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Rp{delimitNumber(item.product.price)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  >
                    <Minus className="size-3" />
                  </Button>
                  <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-destructive hover:bg-destructive/10"
                  onClick={() => removeItem(item.product.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t space-y-3">
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

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={clearItems}
            disabled={items.length === 0}
            className="w-full"
          >
            <Trash2 className="size-4" />
            Clear
          </Button>
          <Button
            variant="default"
            disabled={items.length === 0}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <ShoppingCart className="size-4" />
            Payment
          </Button>
        </div>

        {/* Grand Total Button */}
        <Button
          variant="default"
          size="lg"
          disabled={items.length === 0}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white"
        >
          Grand Total: Rp{delimitNumber(total)}
        </Button>
      </div>
    </div>
  );
}

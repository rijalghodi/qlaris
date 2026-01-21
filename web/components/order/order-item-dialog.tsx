"use client";

import { useOrderStore } from "@/lib/stores/order-store";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Box, Minus, Plus, XIcon, Trash2, ShoppingCart } from "lucide-react";
import { delimitNumber } from "@/lib/number";
import Image from "next/image";
import { useState, useEffect } from "react";
import { NumberInput } from "../ui/number-input";

export function OrderItemDialog() {
  const { selectedOrderItem, setSelectedOrderItem, addItem, updateQuantity, removeItem } =
    useOrderStore();
  const [quantity, setQuantity] = useState(1);

  // Update quantity when selectedOrderItem changes
  useEffect(() => {
    if (selectedOrderItem) {
      setQuantity(selectedOrderItem.quantity);
    }
  }, [selectedOrderItem]);

  const handleClose = () => {
    setSelectedOrderItem(null);
  };

  const handleMinus = () => {
    if (quantity > 0) {
      setQuantity(quantity - 1);
    }
  };

  const handlePlus = () => {
    // Check stock if enabled
    if (
      selectedOrderItem?.product.enableStock &&
      selectedOrderItem?.product.stockQty !== undefined
    ) {
      if (quantity < selectedOrderItem.product.stockQty) {
        setQuantity(quantity + 1);
      }
    } else {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToBucket = () => {
    if (!selectedOrderItem?.product) return;

    if (quantity === 0) {
      // Remove from bucket
      removeItem(selectedOrderItem.product.id);
    } else {
      // Add/update quantity
      addItem(selectedOrderItem.product, quantity);
    }
    handleClose();
  };

  const handleRemoveItem = () => {
    if (!selectedOrderItem?.product) return;
    removeItem(selectedOrderItem.product.id);
    handleClose();
  };

  const handleQuantityChange = (value?: number) => {
    setQuantity(value || 0);
  };

  if (!selectedOrderItem) return null;

  const { product } = selectedOrderItem;

  return (
    <Dialog open={!!selectedOrderItem} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" showCloseButton={false}>
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 relative">
          <DialogClose asChild className="absolute top-3 right-3 z-10">
            <Button variant="ghost" className="bg-background/70 backdrop-blur-lg" size="icon-lg">
              <XIcon />
            </Button>
          </DialogClose>
          {/* Product Image */}
          <div className="aspect-video bg-muted flex items-center justify-center relative overflow-hidden rounded-lg">
            {product.image ? (
              <Image
                className="w-full h-full object-cover"
                src={product.image.url}
                alt={product.name}
                fill
              />
            ) : (
              <Box className="size-20 text-muted-foreground" />
            )}
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold leading-none">{product.name}</h2>
            <div className="flex items-center justify-between gap-2">
              <p className="text-lg font-semibold text-primary leading-none">
                Rp{delimitNumber(product.price)}
              </p>
              {product.enableStock &&
                product.stockQty !== undefined &&
                product.stockQty !== null && (
                  <p className="text-base font-medium text-primary-complement leading-none">
                    {delimitNumber(product.stockQty)} {product.unit || "Pcs"}
                  </p>
                )}
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10"
              onClick={handleMinus}
              disabled={quantity <= 0}
            >
              <Minus className="size-4" />
            </Button>
            <NumberInput
              value={quantity}
              onChange={handleQuantityChange}
              withDelimiter
              hideControls
              min={0}
              max={product.enableStock ? product.stockQty : undefined}
              className="w-20 h-12 bg-transparent border-transparent shadow-none"
              inputClassName="text-center text-2xl sm:text-xl font-semibold"
            />
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10"
              onClick={handlePlus}
              disabled={
                product.enableStock &&
                product.stockQty !== undefined &&
                quantity >= product.stockQty
              }
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            onClick={handleRemoveItem}
            variant="light-destructive"
            size="icon-lg"
            className="rounded-full"
            title="Remove from Bucket"
          >
            <Trash2 className="size-4" />
          </Button>
          <Button
            onClick={handleAddToBucket}
            className="flex-1"
            size="lg"
            variant={quantity === 0 ? "light-destructive" : "default"}
          >
            {quantity === 0 ? <>Remove from Bucket</> : <>Add to Bucket</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

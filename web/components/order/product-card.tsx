"use client";

import { Product } from "@/services/api-product";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Box, Check, Minus, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/number";
import { useOrderStore } from "@/lib/stores/order-store";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "../ui/button";

type ProductCardProps = {
  product: Product;
  className?: string;
};

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem, removeItem, items, setSelectedOrderItem } = useOrderStore();

  const isAdded = items.some((item) => item.product.id === product.id);

  const handleCardClick = () => {
    // Find existing item or create new one
    const existingItem = items.find((item) => item.product.id === product.id);

    if (existingItem) {
      setSelectedOrderItem(existingItem);
    } else {
      // Create a new order item with quantity 1
      setSelectedOrderItem({
        product,
        quantity: 1,
        subtotal: product.price,
      });
    }
  };

  return (
    <Card
      className={cn(
        "group relative rounded-lg transition-all duration-300 cursor-pointer group py-0 gap-2 hover:scale-100",
        className
      )}
      onClick={handleCardClick}
    >
      {/* Add Button Overlay */}
      <div className="absolute top-4 right-4 z-10">
        {isAdded && (
          <div className="size-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground shadow-lg">
            <Check className="size-4" strokeWidth={4} />
          </div>
        )}
      </div>
      {/* <div className="absolute top-4 right-4 z-10">
        <Button
          size="icon"
          className={cn(
            "shadow-lg hover:scale-110 transition-all duration-300 rounded-full",
            isAdded
              ? "bg-destructive/60 backdrop-blur-lg hover:bg-destructive"
              : "bg-primary/60 backdrop-blur-lg hover:bg-primary"
          )}
          onClick={(e) => {
            e.stopPropagation();
            isAdded ? removeItem(product.id) : addItem(product);
          }}
        >
          {isAdded ? <Minus className="size-4" /> : <Plus className="size-4" />}
        </Button>
      </div> */}

      {/* Product Image */}
      <CardHeader className="p-2">
        <div className="aspect-video bg-muted flex items-center justify-center relative overflow-hidden rounded-md">
          {product.image ? (
            <Image
              className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300"
              src={product.image.url}
              alt={product.name}
              fill
            />
          ) : (
            <Box className="size-12 text-muted-foreground group-hover:scale-110 transition-all duration-300" />
          )}
        </div>
      </CardHeader>

      {/* Product Info */}
      <CardContent className="space-y-3 pb-4 px-6">
        <h3 className="text-base font-medium line-clamp-1 leading-none">{product.name}</h3>
        <div className="flex items-center justify-between gap-2">
          <p className="text-base font-semibold text-primary leading-none">
            {formatCurrency(product.price)}
          </p>
          {product.enableStock && product.stockQty !== undefined && product.stockQty !== null && (
            <p className="text-sm font-medium text-primary-complement leading-none">
              {formatCurrency(product.stockQty)} {product.unit || "Pcs"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

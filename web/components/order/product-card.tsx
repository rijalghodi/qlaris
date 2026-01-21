"use client";

import { Product } from "@/services/api-product";
import { Card } from "../ui/card";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Box, Plus } from "lucide-react";
import { delimitNumber } from "@/lib/number";
import { useOrderStore } from "@/lib/stores/order-store";
import { cn } from "@/lib/utils";
import Image from "next/image";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, items } = useOrderStore();

  const isAdded = items.some((item) => item.product.id === product.id);

  return (
    <Card
      className={cn(
        "relative overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
      )}
      onClick={() => !isAdded && addItem(product)}
    >
      {/* Add Button Overlay */}
      <div className="absolute top-2 right-2 z-10">
        <div className="bg-primary text-primary-foreground rounded-full p-1.5">
          <Plus className="size-4" />
        </div>
      </div>

      {/* Product Image */}
      <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
        {product.image ? (
          <Image
            className="w-full h-full object-cover"
            src={product.image.url}
            alt={product.name}
            width={500}
            height={500}
          />
        ) : (
          <Box className="size-12 text-muted-foreground" />
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-medium line-clamp-1">{product.name}</h3>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-primary">Rp{delimitNumber(product.price)}</p>
          {product.enableStock && product.stockQty !== undefined && (
            <p className="text-xs text-muted-foreground">
              {delimitNumber(product.stockQty)} {product.unit || "Pcs"}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

import { cn } from "@/lib/utils";
import { Box, Trash2 } from "lucide-react";
import Image from "next/image";
import { formatCurrency } from "@/lib/number";
import { Button } from "../ui/button";

type IOrderItem = {
  id: string;
  name: string;
  unit?: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  subtotal: number;
};

export function OrderItem({
  item,
  className,
  onRemove,
  onSelect,
}: {
  item: IOrderItem;
  className?: string;
  onRemove: (id: string) => void;
  onSelect: (item: IOrderItem) => void;
}) {
  return (
    <div
      key={item.id}
      className={cn(
        "flex items-start gap-4 p-2 rounded-md hover:bg-accent/50 transition-colors",
        "animate-in fade-in slide-in-from-right-4 duration-300 cursor-pointer",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(item);
      }}
    >
      {/* Product Image */}
      <div className="aspect-square w-12 bg-accent flex items-center justify-center relative overflow-hidden rounded-[8px]">
        {item.imageUrl ? (
          <Image
            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300 shadow-lg"
            src={item.imageUrl}
            alt={item.name}
            fill
          />
        ) : (
          <Box className="size-5 text-muted-foreground group-hover:scale-110 transition-all duration-300" />
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <h4 className="text-base font-medium line-clamp-1">
          {item.name}
          <span className="text-sm text-muted-foreground ml-2">
            {item.quantity}
            {item.unit ? " " + item.unit : "x"}
          </span>
        </h4>
        <p className="text-sm font-medium text-muted-foreground flex gap-2 justify-between items-end">
          <span className="text-muted-foreground text-xs leading-none">
            @{formatCurrency(item.price)}
          </span>
          <span className="font-semibold text-foreground leading-none">
            {formatCurrency(item.subtotal)}
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
          onRemove(item.id);
        }}
      >
        <Trash2 />
      </Button>
    </div>
  );
}

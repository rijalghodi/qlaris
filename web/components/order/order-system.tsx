"use client";

import { OrderPanel } from "./order-panel";
import { OrderItemDialog } from "./order-item-dialog";
import { ProductShowcase } from "./product-showcase";

export function OrderSystem() {
  return (
    <div className="flex h-full gap-6">
      {/* Left Side - Products */}
      <div className="flex-1">
        <ProductShowcase />
      </div>

      {/* Right Side - Order Panel */}
      <div className="w-[400px] animate-in fade-in slide-in-from-right-4  duration-500">
        <OrderPanel />
      </div>

      {/* Order Item Dialog */}
      <OrderItemDialog />
    </div>
  );
}

"use client";

import { CategoryList } from "./category-list";
import { ProductList } from "./product-list";
import { OrderPanel } from "./order-panel";
import { OrderItemDialog } from "./order-item-dialog";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { OrderPaymentDialog } from "./order-payment-dialog";

export function OrderSystem() {
  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      {/* Left Side - Products */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Search */}
        <div className="relative">
          <Input
            placeholder="Search Product"
            className="min-w-[250px] max-w-[400px] w-full shadow-lg bg-card focus-within:bg-card h-11"
            leftSection={<Search className="size-4" />}
          />
        </div>

        {/* Categories */}
        <CategoryList />

        {/* Products Grid */}
        <div className="flex-1 overflow-auto">
          <ProductList />
        </div>
      </div>

      {/* Right Side - Order Panel */}
      <div className="w-[400px]">
        <OrderPanel />
      </div>

      {/* Order Item Dialog */}
      <OrderItemDialog />

      {/* Order Payment Dialog */}
      {/* <OrderPaymentDialog /> */}
    </div>
  );
}

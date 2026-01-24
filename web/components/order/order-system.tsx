"use client";

import { CategoryList } from "./category-list";
import { ProductList } from "./product-list";
import { OrderPanel } from "./order-panel";
import { OrderItemDialog } from "./order-item-dialog";
import { Input } from "../ui/input";
import { Search } from "lucide-react";

export function OrderSystem() {
  return (
    <div className="flex h-full gap-6">
      {/* Left Side - Products */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Search */}
        <div className="relative flex flex-col gap-4 animate-in fade-in slide-in-from-top-4  duration-500">
          <Input
            placeholder="Search Product"
            className="min-w-[250px] max-w-[400px] w-full shadow-lg bg-card focus-within:bg-card h-11"
            leftSection={<Search className="size-4" />}
          />
          <CategoryList />
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-auto animate-in fade-in slide-in-from-bottom-4  duration-500">
          <ProductList />
        </div>
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

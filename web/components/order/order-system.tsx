"use client";

import { CategoryList } from "./category-list";
import { ProductList } from "./product-list";
import { OrderPanel } from "./order-panel";
import { Input } from "../ui/input";
import { Search } from "lucide-react";

export function OrderSystem() {
  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      {/* Left Side - Products */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search Product" className="pl-9" />
        </div>

        {/* Categories */}
        <CategoryList />

        {/* Products Grid */}
        <div className="flex-1 overflow-auto">
          <ProductList />
        </div>
      </div>

      {/* Right Side - Order Panel */}
      <div className="w-[400px] border-l bg-background">
        <OrderPanel />
      </div>
    </div>
  );
}

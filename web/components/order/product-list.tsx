"use client";

import { useProducts } from "@/services/api-product";
import { useOrderStore } from "@/lib/stores/order-store";
import { ProductCard } from "./product-card";
import { Package } from "lucide-react";

export function ProductList() {
  const { selectedCategoryId, getItemCount, items } = useOrderStore();
  const { data, isLoading } = useProducts({ page: 1, pageSize: 100 });

  const products = data?.data || [];
  const filteredProducts = selectedCategoryId
    ? products.filter((p) => p.categoryId === selectedCategoryId)
    : products;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      // REPLCAE WITH empty
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="size-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <>
      {/* {<pre>{JSON.stringify({ selectedCategoryId, getItemCount, items }, null, 2)}</pre>} */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 justify-start">
        {filteredProducts.map((product, idx) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}

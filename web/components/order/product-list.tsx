"use client";

import { Product, useProducts } from "@/services/api-product";
import { useOrderStore } from "@/lib/stores/order-store";
import { ProductCard } from "./product-card";
import { Package } from "lucide-react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

type Props = {
  search?: string;
  isFilterActive?: boolean;
  products: Product[];
  isLoading?: boolean;
};

export function ProductList({ search, isFilterActive, products, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <Package className="text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>No products found</EmptyTitle>
            {isFilterActive ? (
              <EmptyDescription>
                We couldn't find any products for this category or search.
              </EmptyDescription>
            ) : (
              <EmptyDescription>
                Start by adding some in <Link href={ROUTES.PRODUCTS}>Products Page</Link>
              </EmptyDescription>
            )}
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <>
      {/* {<pre>{JSON.stringify({ selectedCategoryId, getItemCount, items }, null, 2)}</pre>} */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 justify-start">
        {products.map((product, idx) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}

"use client";

import { CategoryList } from "./category-list";
import { ProductList } from "./product-list";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { useProducts } from "@/services/api-product";

export function ProductShowcase() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { data, isLoading, isFetching } = useProducts({
    page: 1,
    pageSize: 100,
    categoryId: selectedCategoryId || undefined,
    search,
  });

  const products = data?.data || [];

  const isFilterActive = !!(selectedCategoryId || search);

  return (
    <div className="flex flex-col gap-4 overflow-hidden">
      {/* Search */}
      <div className="relative flex flex-col gap-4 animate-in fade-in slide-in-from-top-4  duration-500">
        <Input
          placeholder="Search Product"
          className="min-w-[250px] max-w-[400px] w-full shadow-lg bg-card focus-within:bg-card h-11"
          leftSection={<Search className="size-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <CategoryList
          selectedCategoryId={selectedCategoryId}
          setSelectedCategory={setSelectedCategoryId}
        />
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-auto animate-in fade-in slide-in-from-bottom-4  duration-500">
        <ProductList
          products={products}
          isFilterActive={isFilterActive}
          isLoading={isLoading || isFetching}
        />
      </div>
    </div>
  );
}

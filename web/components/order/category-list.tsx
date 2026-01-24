"use client";

import { useCategories } from "@/services/api-category";
import { Button } from "../ui/button";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  selectedCategoryId: string | null;
  setSelectedCategory: (id: string | null) => void;
};

export function CategoryList({ selectedCategoryId, setSelectedCategory }: Props) {
  const { data, isLoading } = useCategories({ page: 1, pageSize: 100 });
  const categories = data?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <div className="h-9 w-20 bg-muted animate-pulse rounded-full" />
        <div className="h-9 w-28 bg-muted animate-pulse rounded-full" />
        <div className="h-9 w-24 bg-muted animate-pulse rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      <Button
        variant={selectedCategoryId === null ? "default" : "outline"}
        className="rounded-full shrink-0 px-4"
        onClick={() => setSelectedCategory(null)}
      >
        <Package className="size-4" />
        All
      </Button>
      {categories.map((category, idx) => (
        <Button
          key={category.id}
          variant={selectedCategoryId === category.id ? "default" : "outline"}
          className={cn("rounded-full shrink-0 px-4")}
          onClick={() => setSelectedCategory(category.id)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}

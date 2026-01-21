"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Category, useCategories, useSortCategories } from "@/services/api-category";
import { Button } from "../ui/button";
import { DialogFooter } from "../ui/dialog";
import { ContextDialogProps } from "../ui/dialog-manager";
import { ReactSortable } from "react-sortablejs";
import { GripHorizontal, GripVertical } from "lucide-react";
import { Card, CardContent, CardFooter } from "../ui/card";

type SortCategoryInnerProps = {
  onSuccess?: () => void;
};

export function SortCategoryDialog({
  context,
  id,
  innerProps,
}: ContextDialogProps<SortCategoryInnerProps>) {
  const { data, isLoading } = useCategories({ page: 1, pageSize: 1000 });
  const categories = data?.data || [];

  const [sortedCategories, setSortedCategories] = useState<Category[]>(categories);

  // Update sorted categories when data loads
  React.useEffect(() => {
    if (categories.length > 0) {
      setSortedCategories(categories);
    }
  }, [categories]);

  const sortCategories = useSortCategories({
    onSuccess: () => {
      toast.success("Categories sorted successfully");
      context.closeDialog(id);
      innerProps.onSuccess?.();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleSubmit = () => {
    const categoryIds = sortedCategories.map((cat) => cat.id);
    sortCategories.mutate({ categoryIds });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading categories...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <>
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">No categories to sort</p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => context.closeDialog(id)}>
            Close
          </Button>
        </DialogFooter>
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Drag and drop categories to reorder them</p>
        <ReactSortable
          list={sortedCategories}
          setList={setSortedCategories}
          animation={200}
          handle=".drag-handle"
          className="space-y-2"
        >
          {sortedCategories.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-3 px-4 py-2 cursor-move hover:bg-accent/50 transition-colors border rounded-md drag-handle"
            >
              <div className="cursor-grab active:cursor-grabbing">
                <GripVertical className="size-4 text-muted-foreground" />
              </div>
              <span className="flex-1 text-sm font-medium">{category.name}</span>
            </div>
          ))}
        </ReactSortable>
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => context.closeDialog(id)}
          disabled={sortCategories.isPending}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={sortCategories.isPending}>
          {sortCategories.isPending ? "Saving..." : "Save Order"}
        </Button>
      </DialogFooter>
    </>
  );
}

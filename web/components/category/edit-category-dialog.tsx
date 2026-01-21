"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Category, useUpdateCategory } from "@/services/api-category";
import { Button } from "../ui/button";
import { DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { ContextDialogProps } from "../ui/dialog-manager";

type EditCategoryInnerProps = {
  category: Category;
  onSuccess?: () => void;
};

type FormData = {
  name: string;
};

export function EditCategoryDialog({
  context,
  id,
  innerProps,
}: ContextDialogProps<EditCategoryInnerProps>) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: innerProps.category.name,
    },
  });

  useEffect(() => {
    reset({ name: innerProps.category.name });
  }, [innerProps.category, reset]);

  const updateCategory = useUpdateCategory({
    onSuccess: () => {
      toast.success("Category updated successfully");
      context.closeDialog(id);
      innerProps.onSuccess?.();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onSubmit = (data: FormData) => {
    updateCategory.mutate({ id: innerProps.category.id, data });
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Input
              id="name"
              placeholder="Enter category name"
              aria-invalid={!!errors.name}
              {...register("name", {
                required: "Category name is required",
                maxLength: {
                  value: 255,
                  message: "Category name must not exceed 255 characters",
                },
              })}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => context.closeDialog(id)}
            disabled={updateCategory.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateCategory.isPending}>
            {updateCategory.isPending ? "Updating..." : "Update Category"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

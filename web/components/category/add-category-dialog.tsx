"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CategoryRes, useCreateCategory } from "@/services/api-category";
import { Button } from "../ui/button";
import { DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { ContextDialogProps } from "../ui/dialog-manager";

type AddCategoryInnerProps = {
  onSuccess?: (newCategory: CategoryRes) => void;
};

type FormData = {
  name: string;
};

export function AddCategoryDialog({
  context,
  id,
  innerProps,
}: ContextDialogProps<AddCategoryInnerProps>) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const createCategory = useCreateCategory({
    onSuccess: (data) => {
      toast.success("Category created successfully");
      reset();
      context.closeDialog(id);
      innerProps.onSuccess?.(data);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onSubmit = (data: FormData) => {
    createCategory.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 py-4">
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
          disabled={createCategory.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={createCategory.isPending}>
          {createCategory.isPending ? "Creating..." : "Create Category"}
        </Button>
      </DialogFooter>
    </form>
  );
}

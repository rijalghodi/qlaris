"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useCreateCategory } from "@/services/api-category";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type AddCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

type FormData = {
  name: string;
};

export function AddCategoryDialog({ open, onOpenChange, onSuccess }: AddCategoryDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const createCategory = useCreateCategory({
    onSuccess: () => {
      toast.success("Category created successfully");
      reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onSubmit = (data: FormData) => {
    createCategory.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>Add a new category for organizing your products.</DialogDescription>
        </DialogHeader>
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
              onClick={() => onOpenChange(false)}
              disabled={createCategory.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createCategory.isPending}>
              {createCategory.isPending ? "Creating..." : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Context and Provider

type AddCategoryDialogContextType = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const AddCategoryDialogContext = React.createContext<AddCategoryDialogContextType | undefined>(
  undefined
);

export function useAddCategoryDialog() {
  const context = React.useContext(AddCategoryDialogContext);
  if (!context) {
    throw new Error("useAddCategoryDialog must be used within AddCategoryDialogProvider");
  }
  return context;
}

type AddCategoryDialogProviderProps = {
  children: React.ReactNode;
  onSuccess?: () => void;
};

export function AddCategoryDialogProvider({ children, onSuccess }: AddCategoryDialogProviderProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);

  return (
    <AddCategoryDialogContext.Provider value={{ open, close, isOpen }}>
      {children}
      <AddCategoryDialog open={isOpen} onOpenChange={setIsOpen} onSuccess={onSuccess} />
    </AddCategoryDialogContext.Provider>
  );
}

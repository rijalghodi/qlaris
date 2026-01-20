"use client";

import React from "react";
import { SelectInput, SelectInputProps } from "../ui/select-input";
import { CategoryRes, useCategories } from "@/services/api-category";
import { dialogs } from "../ui/dialog-manager";

type Props = {
  value?: string;
  onChange?: (value?: string) => void;
} & SelectInputProps;

export function CategoryInput({ value, onChange, ...props }: Props) {
  // Fetch categories
  const { data: categoriesData, refetch } = useCategories({ pageSize: 100 });

  // Transform categories to options format
  const options = React.useMemo(() => {
    return (
      categoriesData?.data?.map((category) => ({
        label: category.name,
        value: category.id,
      })) || []
    );
  }, [categoriesData]);

  const handleCreate = () => {
    dialogs.openContextDialog({
      modal: "addCategory",
      title: "Create New Category",
      description: "Add a new category for organizing your products.",
      size: "sm",
      innerProps: {
        onSuccess: (data: CategoryRes) => {
          refetch();
          console.log(data);
          // select created one
          onChange?.(data.data?.id);
        },
      },
    });
  };

  return (
    <SelectInput
      placeholder="Select"
      options={options}
      className="rounded-full"
      withCreate
      createLabel="Create New Category"
      onCreate={handleCreate}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
}

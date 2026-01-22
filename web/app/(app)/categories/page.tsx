"use client";

import { CategoryDashboard } from "@/components/category/category-dashboard";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Plus } from "lucide-react";
import { AddCategoryDialog } from "@/components/category/add-category-dialog";
import { dialogs } from "@/components/ui/dialog-manager";
import { ROUTES } from "@/lib/routes";

export default function CategoriesPage() {
  return (
    <div className="container mx-auto py-5 px-4 sm:px-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-left-4 ease-in duration-300">
          <h1 className="text-2xl font-semibold leading-none">Categories</h1>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: ROUTES.DASHBOARD },
              { label: "Categories", href: ROUTES.CATEGORIES },
            ]}
          />
        </div>

        {/* Search and Actions */}

        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 ease-in duration-300">
          <Button
            variant="ghost"
            className="rounded-full"
            onClick={() => {
              dialogs.openContextDialog({
                modal: "sortCategory",
                title: "Sort Categories",
                size: "lg",
                innerProps: {},
              });
            }}
          >
            <ArrowUpDown />
            Sort
          </Button>

          <Button
            variant="default"
            className="rounded-full"
            onClick={() => {
              dialogs.openContextDialog({
                modal: "addCategory",
                title: "Add Category",
                description: "Create a new category for your products",
                size: "sm",
                innerProps: {},
              });
            }}
          >
            <Plus />
            Add Category
          </Button>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 ease-in duration-300">
        <CategoryDashboard />
      </div>
    </div>
  );
}

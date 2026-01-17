import { AddProductForm } from "@/components/product/add-product-form";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function AddProductPage() {
  return (
    <div className="container mx-auto py-4 px-4 sm:px-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold leading-none">Create Product</h1>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Create Product", href: "/products/add" },
            ]}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="shrink-0 rounded-full">
            <RotateCcw className="size-4" />
          </Button>
          <Button variant="outline" size="icon" className="shrink-0 rounded-full">
            <ArrowLeft className="size-4" />
          </Button>
          <Button asChild variant="default" className="shrink-0 rounded-full">
            <Link href={ROUTES.PRODUCTS}>← Back to Products</Link>
          </Button>
        </div>
      </div>

      <AddProductForm />
    </div>
  );
}

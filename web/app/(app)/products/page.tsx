import { ProductDashboard } from "@/components/product/product-dashboard";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Upload } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export default function ProductsPage() {
  return (
    <div className="container mx-auto py-4 px-4 sm:px-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold leading-none">Products</h1>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Products", href: "/products" },
            ]}
          />
        </div>

        {/* Search and Actions */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="shrink-0 rounded-full">
              <FileText className="text-destructive" />
            </Button>
            <Button variant="outline" size="icon" className="shrink-0 rounded-full">
              <FileText className="text-primary" />
            </Button>
            <Button
              asChild
              variant="default"
              className="bg-orange-500 hover:bg-orange-600 shrink-0 rounded-full"
            >
              <Link href={`${ROUTES.PRODUCTS}/add`}>
                <Plus />
                Add Product
              </Link>
            </Button>
            <Button variant="default" className="shrink-0 rounded-full">
              <Upload />
              Import Product
            </Button>
          </div>
        </div>
      </div>

      <ProductDashboard />
    </div>
  );
}

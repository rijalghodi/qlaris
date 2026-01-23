"use client";

import { EditProductForm } from "@/components/product/edit-product-form";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useProduct } from "@/services/api-product";
import { useParams } from "next/navigation";

interface EditProductPageProps {
  params: Promise<{
    productId: string;
  }>;
}

export default function EditProductPage() {
  const { productId } = useParams<{ productId: string }>();

  const { data, isLoading, isFetching, error } = useProduct(productId);
  const productData = data?.data;

  if (isLoading || isFetching) {
    return (
      <div className="container mx-auto py-5 px-4 sm:px-6 max-w-7xl">
        <div className="flex items-center justify-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-5 px-4 sm:px-6 max-w-7xl">
        <div className="flex items-center justify-center">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-5 px-4 sm:px-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-left-4 ease-in duration-300">
          <h1 className="text-2xl font-semibold leading-none">Edit Product</h1>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: ROUTES.DASHBOARD },
              { label: "Products", href: ROUTES.PRODUCTS },
              { label: "Edit Product", href: ROUTES.PRODUCT_EDIT(productId) },
            ]}
          />
        </div>

        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 ease-in duration-300">
          <Button asChild variant="secondary" className="shrink-0 rounded-full">
            <Link href={ROUTES.PRODUCTS}>
              <ArrowLeft /> Back to Products
            </Link>
          </Button>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 ease-in duration-300">
        <EditProductForm productId={productId} defaultValues={productData} />
      </div>
    </div>
  );
}

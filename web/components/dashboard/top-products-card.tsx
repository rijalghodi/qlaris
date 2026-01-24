import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Box, ChevronRight, Package } from "lucide-react";
import Image from "next/image";
import { TopProduct } from "@/services/api-dashboard";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { EmptyState } from "../ui/empty";

type Props = {
  products: TopProduct[];
};

export function TopProductsCard({ products }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 justify-between">
        <h2 className="font-semibold text-lg">Top Products</h2>
        <Button variant="link" size="default" asChild>
          <Link href={ROUTES.PRODUCTS}>
            View All
            <ChevronRight />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-0">
        {products.length === 0 ? (
          <EmptyState
            title="No products yet"
            description="Once you add a product, it will appear here."
            icon={<Box className="size-6 text-muted-foreground" />}
          />
        ) : (
          products.map((product, index) => (
            <TopProductCard key={product.id} product={product} rank={index + 1} />
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function TopProductCard({
  product,
  className,
  rank,
}: {
  product: TopProduct;
  className?: string;
  rank: number;
}) {
  return (
    <div key={product.id} className={cn("p-4 border-b last:border-0", className)}>
      <div className="flex items-center gap-5">
        {/* Rank */}
        <div className="font-semibold text-xl">{rank}.</div>

        {/* Image */}
        <div className="relative size-12 rounded-md bg-muted shrink-0 overflow-hidden">
          {product.image?.url ? (
            <Image src={product.image.url} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Box className="size-6 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-base truncate">{product.name}</p>
              {product.category && (
                <p className="text-primary font-medium text-sm">{product.category.name}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="font-semibold text-lg">
                {product.quantitySold} <span className="text-sm text-muted-foreground">sold</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

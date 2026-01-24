"use client";

import { Dashboard } from "@/components/dashboard/dashboard";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { useGetCurrentUser } from "@/services/api-user";
import { Box, Plus } from "lucide-react";
import Link from "next/link";

export default function Page() {
  const { data: userData } = useGetCurrentUser();
  return (
    <div className="container py-4 px-4 max-w-7xl mx-auto">
      <div className="mb-5 flex items-center justify-between">
        <div className="animate-in fade-in slide-in-from-top-4  duration-500">
          <h1 className="text-2xl font-semibold tracking-tight mb-2">
            Hello, {userData?.data?.name}
          </h1>
          <p className="text-muted-foreground text-sm">Give your best shot today!</p>
        </div>
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4  duration-500">
          <Button variant="outline" size="lg" asChild className="rounded-full px-6 shadow-lg">
            <Link href={ROUTES.PRODUCT_ADD}>
              <Box />
              New Product
            </Link>
          </Button>
          <Button variant="default" size="lg" asChild className="rounded-full px-6">
            <Link href={ROUTES.NEW_TRANSACTION}>
              <Plus />
              New Transaction
            </Link>
          </Button>
        </div>
      </div>
      <Dashboard />
    </div>
  );
}

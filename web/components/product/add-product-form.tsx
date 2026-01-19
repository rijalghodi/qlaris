"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod/v3";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateProduct } from "@/services/api-product";
import { ROUTES } from "@/lib/routes";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { ImageInput } from "../ui/image-input";
import { Info } from "lucide-react";
import { NumberInput } from "../ui/number-input";
import { ImageInput } from "../ui/image-input-2";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255, "Product name is too long"),
  price: z.number().min(0, "Price must be at least 0"),
  stockQty: z.number().int().min(0, "Stock quantity must be at least 0"),
  image: z.string().optional().or(z.literal("")),
});

type ProductFormData = z.infer<typeof productSchema>;

export function AddProductForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
      stockQty: 0,
      image: "",
    },
  });

  const { mutate: createProduct } = useCreateProduct({
    onSuccess: () => {
      toast.success("Product created successfully!");
      router.push(ROUTES.PRODUCTS);
    },
    onError: (error) => {
      toast.error(error || "Failed to create product");
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: ProductFormData) => {
    setIsSubmitting(true);
    const payload = {
      name: data.name,
      price: data.price,
      stockQty: data.stockQty,
      image: data.image || undefined,
    };
    createProduct(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="">
          <CardHeader className="border-b pb-4!">
            <div className="flex items-center gap-2">
              <Info className="size-4 text-orange-500" />
              <h2 className="text-base font-semibold">Product Information</h2>
            </div>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Product Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Example: Nasi Padang" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Price <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <NumberInput
                      leftSection="Rp"
                      step={1000}
                      placeholder="Example: 20000"
                      min={0}
                      max={1_000_000_000_000}
                      withDelimiter
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stockQty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Stock Quantity <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <NumberInput placeholder="0" min={0} max={1_000_000} withDelimiter {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <ImageInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="sticky bottom-0">
          <CardContent>
            <div className="flex items-center gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(ROUTES.PRODUCTS)}
                disabled={isSubmitting}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-orange-500 hover:bg-orange-600 rounded-full"
              >
                {isSubmitting ? "Creating..." : "Create Product"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

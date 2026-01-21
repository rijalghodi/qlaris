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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUpdateProduct, type Product } from "@/services/api-product";
import { ROUTES } from "@/lib/routes";
import { toast } from "sonner";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Box, Layers, ScanBarcode } from "lucide-react";
import { NumberInput } from "../ui/number-input";
import { ImageInput } from "../ui/image-input-2";
import { Switch } from "../ui/switch";
import { BarcodeDialogInput } from "../ui/barcode-scan-dialog";
import { CategoryInput } from "../category/category-input";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255, "Product name is too long"),
  price: z.number().min(0, "Price must be at least 0"),
  image: z.string().optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
  enableStock: z.boolean().optional(),
  stockQty: z.number().int().min(0, "Stock quantity must be at least 0").optional(),
  unit: z.string().optional().or(z.literal("")),
  enableBarcode: z.boolean().optional(),
  barcodeValue: z.string().optional().or(z.literal("")),
  barcodeType: z.string().optional().or(z.literal("")),
  cost: z.number().min(0, "Cost must be at least 0").optional(),
  isActive: z.boolean().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface EditProductFormProps {
  productId: string;
  defaultValues?: Product;
}

export function EditProductForm({ productId, defaultValues }: EditProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      price: defaultValues?.price || undefined,
      image: defaultValues?.image?.key || "",
      categoryId: defaultValues?.categoryId || "",
      enableStock: defaultValues?.enableStock || undefined,
      stockQty: defaultValues?.stockQty || undefined,
      unit: defaultValues?.unit || "",
      enableBarcode: defaultValues?.enableBarcode || undefined,
      barcodeValue: defaultValues?.barcodeValue || "",
      barcodeType: defaultValues?.barcodeType || "",
      cost: defaultValues?.cost || undefined,
      isActive: defaultValues?.isActive || undefined,
    },
  });

  const { mutate: updateProduct } = useUpdateProduct({
    onSuccess: () => {
      toast.success("Product updated successfully!");
      router.push(ROUTES.PRODUCTS);
    },
    onError: (error) => {
      toast.error(error || "Failed to update product");
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: ProductFormData) => {
    setIsSubmitting(true);
    console.log(data);
    const payload = {
      name: data.name,
      price: data.price,
      image: data.image || undefined,
      categoryId: data.categoryId || undefined,
      enableStock: data.enableStock,
      stockQty: data.stockQty,
      unit: data.unit || undefined,
      enableBarcode: data.enableBarcode,
      barcodeValue: data.barcodeValue || undefined,
      barcodeType: data.barcodeType || undefined,
      cost: data.cost,
      isActive: data.isActive,
    };
    updateProduct({ id: productId, data: payload });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="">
          <CardHeader className="border-b pb-4!">
            <div className="flex items-center gap-2">
              <Box className="size-4 text-primary" />
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
                    <Input placeholder="e.g., Noodle" {...field} />
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
                      placeholder="e.g., 20000"
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
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <CategoryInput
                      placeholder="Select"
                      className="rounded-full"
                      withCreate
                      createLabel="Create New Category"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost (Buying Price)</FormLabel>
                  <FormControl>
                    <NumberInput
                      leftSection="Rp"
                      step={1000}
                      placeholder="e.g., 15000"
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
              name="image"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <ImageInput {...field} defaultValue={defaultValues?.image?.url} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={form.watch("enableBarcode") ? "border-b pb-4!" : ""}>
            <CardTitle>
              <ScanBarcode className="inline mr-2 size-4 text-primary" />
              Barcode
            </CardTitle>
            <CardAction>
              <FormField
                control={form.control}
                name="enableBarcode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-3">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} size="lg" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardAction>
          </CardHeader>
          {form.watch("enableBarcode") && (
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1">
                <BarcodeDialogInput
                  value={form.watch("barcodeValue")}
                  onChange={(value) => form.setValue("barcodeValue", value || "")}
                />
              </div>
              <div className="col-span-1 space-y-4">
                <FormField
                  control={form.control}
                  name="barcodeValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barcode Value</FormLabel>
                      <FormDescription>
                        Must be unique. Can enter via barcode scanner or manually.
                      </FormDescription>
                      <FormControl>
                        <Input
                          placeholder="e.g., 1234567890"
                          {...field}
                          rightSection={
                            <BarcodeDialogInput
                              value={form.watch("barcodeValue")}
                              onChange={(value) => form.setValue("barcodeValue", value || "")}
                            >
                              {({ value, open }) => (
                                <Button
                                  variant="ghost"
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    open?.();
                                  }}
                                >
                                  <ScanBarcode className="size-4" />
                                </Button>
                              )}
                            </BarcodeDialogInput>
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader className={form.watch("enableStock") ? "border-b pb-4!" : ""}>
            <CardTitle>
              <Layers className="inline mr-2 size-4 text-primary" />
              Stock Management
            </CardTitle>
            <CardAction>
              <FormField
                control={form.control}
                name="enableStock"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-3">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} size="lg" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardAction>
          </CardHeader>

          {form.watch("enableStock") && (
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="stockQty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <NumberInput
                        placeholder="0"
                        min={0}
                        max={1_000_000}
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
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., pcs, kg, box" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          )}
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Product"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

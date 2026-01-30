"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod/v3";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageInput } from "@/components/ui/image-input";

import { useEditCurrentUserBusiness, type UserRes } from "@/services/api-user";
import { SelectInput } from "../ui/select-input";
import { BUSINESS_CATEGORIES, EMPLOYEE_COUNT } from "@/lib/constant";

const businessSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessCode: z.string().optional(),
  businessAddress: z.string().optional(),
  businessCategory: z.string().optional(),
  businessEmployeeSize: z.string().optional(),
  businessLogo: z.string().optional(),
});

type BusinessFormData = z.infer<typeof businessSchema>;

export function EditBusinessCard({ user }: { user: UserRes }) {
  const { mutate: updateBusiness, isPending } = useEditCurrentUserBusiness({
    onSuccess: () => {
      toast.success("Business information updated successfully");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      businessName: user.business?.name || "",
      businessCode: user.business?.code || "",
      businessAddress: user.business?.address || "",
      businessCategory: user.business?.category,
      businessEmployeeSize: user.business?.employeeSize,
      businessLogo: user.business?.logo?.key || "",
    },
  });

  const onSubmit = (data: BusinessFormData) => {
    updateBusiness({
      name: data.businessName,
      address: data.businessAddress || undefined,
      category: data.businessCategory || undefined,
      employeeSize: data.businessEmployeeSize || undefined,
      logo: data.businessLogo || undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Information</CardTitle>
        <CardDescription>Update your business details and settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="businessLogo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Logo</FormLabel>
                  <FormControl>
                    <ImageInput
                      {...field}
                      defaultValueUrl={user.business?.logo?.url}
                      folder="businesses"
                      className="rounded-full w-24 h-24 sm:w-28 sm:h-28"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Business Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Business Code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Category</FormLabel>
                    <SelectInput
                      placeholder="Select category"
                      options={BUSINESS_CATEGORIES}
                      {...field}
                    />

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessEmployeeSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Number</FormLabel>
                    <SelectInput placeholder="Select size" options={EMPLOYEE_COUNT} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="businessAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Business Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={!form.formState.isDirty || isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

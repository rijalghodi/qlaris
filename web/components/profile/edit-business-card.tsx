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
  FormDescription,
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
  name: z.string().optional(),
  code: z.string().optional(),
  address: z.string().optional(),
  category: z.string().optional(),
  employeeSize: z.string().optional(),
  logo: z.string().optional(),
  logoUrl: z.string().optional(),
});

type BusinessFormData = z.infer<typeof businessSchema>;

export function EditBusinessCard({
  business,
  readOnly = false,
}: {
  business: BusinessFormData;
  readOnly?: boolean;
}) {
  const { mutate: updateBusiness, isPending } = useEditCurrentUserBusiness({
    onSuccess: (data) => {
      toast.success("Business information updated successfully");
      const business = data.data;
      console.log(business);
      form.reset({
        name: business?.name || "",
        code: business?.code || "",
        address: business?.address || "",
        category: business?.category,
        employeeSize: business?.employeeSize,
        logo: business?.logo?.key || "",
        logoUrl: business?.logo?.url || "",
      });
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: business.name || "",
      code: business.code || "",
      address: business.address || "",
      category: business.category,
      employeeSize: business.employeeSize,
      logo: business.logo || "",
      logoUrl: business.logoUrl || "",
    },
  });

  const onSubmit = (data: BusinessFormData) => {
    updateBusiness({
      name: data.name,
      address: data.address || undefined,
      category: data.category || undefined,
      employeeSize: data.employeeSize || undefined,
      logo: data.logo || undefined,
      code: data.code || undefined,
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Logo</FormLabel>
                    <FormControl>
                      <ImageInput
                        {...field}
                        defaultValueUrl={business.logoUrl}
                        folder="businesses"
                        className="rounded-full w-24 h-24 sm:w-28 sm:h-28"
                        readOnly={readOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Code</FormLabel>
                    <FormDescription>Share this code with your employees to login.</FormDescription>
                    <FormControl>
                      <Input
                        placeholder="Business Code"
                        className="h-11"
                        inputClassName="font-mono text-lg sm:text-lg"
                        {...field}
                        readOnly={readOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Business Name" {...field} readOnly={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Category</FormLabel>
                    <SelectInput
                      placeholder="Select category"
                      options={BUSINESS_CATEGORIES}
                      disabled={readOnly}
                      {...field}
                    />

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employeeSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Number</FormLabel>
                    <SelectInput
                      placeholder="Select size"
                      options={EMPLOYEE_COUNT}
                      disabled={readOnly}
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Business Address" {...field} readOnly={readOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!readOnly && (
              <div className="flex justify-end">
                <Button type="submit" disabled={!form.formState.isDirty || isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

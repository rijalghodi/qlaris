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
import { useCreateEmployee } from "@/services/api-employee";
import { ROUTES } from "@/lib/routes";
import { toast } from "sonner";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lock } from "lucide-react";
import { ImageInput } from "../ui/image-input-2";
import { Switch } from "../ui/switch";
import { SelectInput } from "../ui/select-input";
import { Role } from "@/lib/constant";
import { InputOTP } from "../ui/input-otp";

const employeeSchema = z.object({
  name: z.string().min(1, "Employee name is required").max(255, "Employee name is too long"),
  pin: z
    .string()
    .length(6, "PIN must be exactly 6 digits")
    .regex(/^\d+$/, "PIN must contain only numbers"),
  role: z.enum([Role.CASHIER, Role.MANAGER], {
    required_error: "Role is required",
  }),
  image: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export function AddEmployeeForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: "",
      pin: "",
      role: undefined,
      image: "",
      phone: "",
      email: "",
      isActive: true,
    },
  });

  const { mutate: createEmployee } = useCreateEmployee({
    onSuccess: () => {
      toast.success("Employee created successfully!");
      router.push(ROUTES.EMPLOYEES);
    },
    onError: (error) => {
      toast.error(error || "Failed to create employee");
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: EmployeeFormData) => {
    setIsSubmitting(true);
    const payload = {
      name: data.name,
      pin: data.pin,
      role: data.role,
      image: data.image || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
      isActive: data.isActive,
    };
    createEmployee(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="">
          <CardHeader className="border-b pb-4!">
            <div className="flex items-center gap-2">
              <User className="size-4 text-primary" />
              <h2 className="text-base font-semibold">Personal Information</h2>
            </div>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Employee Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Role <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <SelectInput
                      placeholder="Select role"
                      options={[
                        { label: "Cashier", value: Role.CASHIER },
                        { label: "Manager", value: Role.MANAGER },
                      ]}
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
                    <ImageInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b pb-4!">
            <CardTitle>
              <Lock className="inline mr-2 size-4 text-primary" />
              Security
            </CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    PIN Code <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormDescription>6-digit PIN for employee login</FormDescription>
                  <FormControl>
                    <InputOTP maxLength={6} value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-input">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>Enable or disable employee access</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
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
                onClick={() => router.push(ROUTES.EMPLOYEES)}
                disabled={isSubmitting}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-full">
                {isSubmitting ? "Creating..." : "Create Employee"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

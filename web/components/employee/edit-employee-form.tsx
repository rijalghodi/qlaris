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
import { useUpdateEmployee, type Employee } from "@/services/api-employee";
import { ROUTES } from "@/lib/routes";
import { toast } from "sonner";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lock } from "lucide-react";
import { ImageInput } from "../ui/image-input-2";
import { Switch } from "../ui/switch";
import { SelectInput } from "../ui/select-input";
import { EmployeeRole } from "@/lib/constant";
import { InputOTP } from "../ui/input-otp";

const employeeSchema = z.object({
  name: z.string().min(1, "Employee name is required").max(255, "Employee name is too long"),
  pin: z
    .string()
    .length(6, "PIN must be exactly 6 digits")
    .regex(/^\d+$/, "PIN must contain only numbers")
    .optional()
    .or(z.literal("")),
  role: z.enum([EmployeeRole.CASHIER, EmployeeRole.MANAGER], {
    required_error: "Role is required",
  }),
  image: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EditEmployeeFormProps {
  employeeId: string;
  defaultValues?: Employee;
}

export function EditEmployeeForm({ employeeId, defaultValues }: EditEmployeeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      pin: "",
      role: defaultValues?.role || EmployeeRole.CASHIER,
      image: defaultValues?.image?.key || "",
      phone: defaultValues?.phone || "",
      email: defaultValues?.email || "",
      isActive: defaultValues?.isActive ?? true,
    },
  });

  const { mutate: updateEmployee } = useUpdateEmployee({
    onSuccess: () => {
      toast.success("Employee updated successfully!");
      router.push(ROUTES.EMPLOYEES);
    },
    onError: (error) => {
      toast.error(error || "Failed to update employee");
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: EmployeeFormData) => {
    setIsSubmitting(true);
    const payload = {
      name: data.name,
      pin: data.pin || undefined,
      role: data.role,
      image: data.image || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
      isActive: data.isActive,
    };
    updateEmployee({ id: employeeId, data: payload });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="">
          <CardHeader className="border-b pb-4!">
            <div className="flex items-center gap-2">
              <User className="size-4 text-primary" />
              <h2 className="text-base font-semibold">Employee Information</h2>
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
                        { label: "Cashier", value: EmployeeRole.CASHIER },
                        { label: "Manager", value: EmployeeRole.MANAGER },
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="e.g., john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 081234567890" {...field} />
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
                  <FormLabel>PIN Code</FormLabel>
                  <FormDescription>
                    Leave empty to keep current PIN. Enter new 6-digit PIN to change.
                  </FormDescription>
                  <FormControl>
                    <InputOTP maxLength={6} value={field.value || ""} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Employee"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

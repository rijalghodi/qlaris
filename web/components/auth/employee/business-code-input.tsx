"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { ROUTES } from "@/lib/routes";

const businessCodeSchema = z.object({
  businessCode: z.string().min(1, "Business code is required"),
});

type BusinessCodeFormData = z.infer<typeof businessCodeSchema>;

interface BusinessCodeInputProps {
  onSubmit: (businessCode: string) => void;
}

export function BusinessCodeInput({ onSubmit }: BusinessCodeInputProps) {
  const form = useForm<BusinessCodeFormData>({
    resolver: zodResolver(businessCodeSchema),
    defaultValues: { businessCode: "" },
  });

  const handleSubmit = (data: BusinessCodeFormData) => {
    onSubmit(data.businessCode);
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <p className="text-base text-center">Enter your store code</p>
      <p className="text-sm text-muted-foreground text-center">
        It can be found in your manager’s settings. Ask them for it.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="businessCode"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Store Code"
                    className="font-mono h-12"
                    inputClassName="font-mono sm:text-lg text-center font-medium"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="h-10 w-full rounded-full">
            Continue
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        Not an employee?{" "}
        <Link
          href={ROUTES.LOGIN}
          className="hover:underline underline-offset-4 font-medium text-foreground"
        >
          Login as Owner
        </Link>
      </p>
    </div>
  );
}

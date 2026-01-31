"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { ROUTES } from "@/lib/routes";
import { ArrowRight } from "lucide-react";

const businessCodeSchema = z.object({
  businessCode: z.string().min(1, "Business code is required"),
});

type BusinessCodeFormData = z.infer<typeof businessCodeSchema>;

interface BusinessCodeInputProps {
  businessCode?: string;
  onSubmit: (businessCode: string) => void;
}

export function BusinessCodeInput({ businessCode = "", onSubmit }: BusinessCodeInputProps) {
  const form = useForm<BusinessCodeFormData>({
    resolver: zodResolver(businessCodeSchema),
    defaultValues: { businessCode: businessCode },
  });

  const handleSubmit = (data: BusinessCodeFormData) => {
    onSubmit(data.businessCode);
  };

  return (
    <div className="space-y-4 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out">
      <p className="text-lg font-semibold">Enter your store code</p>
      <p className="text-sm text-muted-foreground">
        It can be found in your manager’s settings. Ask them for it.
      </p>
      <p className="text-sm text-muted-foreground">Business code: {businessCode}</p>
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
                    className="font-mono h-11"
                    inputClassName="font-mono sm:text-lg font-medium"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="h-10 rounded-full">
            Continue <ArrowRight />
          </Button>
        </form>
      </Form>

      <p className="text-sm text-muted-foreground">
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

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useResetPassword } from "@/services/api-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>("");

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema as any),
    defaultValues: {
      token: searchParams.get("token") || "",
      password: "",
      confirmPassword: "",
    },
  });

  const { mutate: resetPassword, isPending } = useResetPassword({
    onSuccess: (data) => {
      console.log("Reset password successful:", data);
      // Redirect to login page after successful reset
      router.push("/login");
    },
    onError: (errorMessage) => {
      console.error("Reset password error:", errorMessage);
      setError(errorMessage);
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError(""); // Clear previous errors
    resetPassword({
      token: data.token,
      password: data.password,
    });
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Reset Password</h1>
        <p className="text-sm text-muted-foreground">Enter your new password</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="token"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reset Token</FormLabel>
                <FormControl>
                  <Input placeholder="Enter reset token" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="New Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Confirm Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={isPending}
            className="h-10 w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
          >
            {isPending ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </Form>

      {/* Back to Login */}
      <p className="px-8 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link
          href="/login"
          className="hover:underline underline-offset-4 font-medium text-foreground"
        >
          Back to Login
        </Link>
      </p>
    </div>
  );
}

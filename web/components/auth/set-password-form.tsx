"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useSetPassword } from "@/services/api-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const setPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SetPasswordFormData = z.infer<typeof setPasswordSchema>;

export function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>("");

  const form = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordSchema as any),
    defaultValues: {
      token: searchParams.get("token") || "",
      password: "",
      confirmPassword: "",
    },
  });

  const { mutate: setPassword, isPending } = useSetPassword({
    onSuccess: (data) => {
      console.log("Set password successful:", data);
      // Redirect to login page after successful password setup
      router.push("/login");
    },
    onError: (errorMessage) => {
      console.error("Set password error:", errorMessage);
      setError(errorMessage);
    },
  });

  const onSubmit = async (data: SetPasswordFormData) => {
    setError(""); // Clear previous errors
    setPassword({
      token: data.token,
      password: data.password,
    });
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Set Your Password</h1>
        <p className="text-sm text-muted-foreground">Create a password for your new account</p>
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
                <FormLabel>Verification Token</FormLabel>
                <FormControl>
                  <Input placeholder="Enter verification token" {...field} />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Create Password" {...field} />
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
          <Button type="submit" disabled={isPending} className="h-10 w-full rounded-full">
            {isPending ? "Setting up..." : "Set Password"}
          </Button>
        </form>
      </Form>

      {/* Back to Login */}
      <p className="px-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="hover:underline underline-offset-4 font-medium text-foreground"
        >
          Login
        </Link>
      </p>
    </div>
  );
}

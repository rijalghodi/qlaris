"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useForgotPassword } from "@/services/api-auth";
import { useState } from "react";
import { useCountdown } from "@/hooks/use-countdown";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [nextRequestAt, setNextRequestAt] = useState<string | null>(null);

  const { isExpired, formattedTime } = useCountdown(nextRequestAt);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema as any),
    defaultValues: {
      email: "",
    },
  });

  const { mutate: forgotPassword, isPending } = useForgotPassword({
    onSuccess: (data) => {
      console.log("Forgot password successful:", data);
      setSuccess(true);
      setError("");
      setNextRequestAt(data.data?.nextRequestAt || null);
    },
    onError: (errorMessage) => {
      console.error("Forgot password error:", errorMessage);
      setError(errorMessage);
      setSuccess(false);
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(""); // Clear previous errors
    setSuccess(false);
    forgotPassword(data);
  };

  const isDisabled = isPending || (!isExpired && success);

  return (
    <div className="w-full max-w-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Forgot Password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email to receive a password reset link
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="rounded-md bg-primary/10 p-3 text-sm text-primary">
          Password reset link has been sent to your email. Please check your inbox.
          {!isExpired && (
            <p className="mt-1 text-xs">You can request another reset in {formattedTime}</p>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive text-center">
          {error}
        </div>
      )}

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Your Email" {...field} disabled={isDisabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isDisabled} className="h-10 w-full rounded-full">
            {isPending
              ? "Sending..."
              : !isExpired && success
                ? `Resend in ${formattedTime}`
                : "Send Reset Link"}
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

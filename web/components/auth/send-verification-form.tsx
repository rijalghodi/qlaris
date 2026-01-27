"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useSendVerification } from "@/services/api-auth";
import { useState } from "react";
import { useCountdown } from "@/hooks/use-countdown";

const sendVerificationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type SendVerificationFormData = z.infer<typeof sendVerificationSchema>;

export function SendVerificationForm() {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [nextRequestAt, setNextRequestAt] = useState<string | null>(null);

  const { isExpired, formattedTime } = useCountdown(nextRequestAt);

  const form = useForm<SendVerificationFormData>({
    resolver: zodResolver(sendVerificationSchema as any),
    defaultValues: {
      email: "",
    },
  });

  const { mutate: sendVerification, isPending } = useSendVerification({
    onSuccess: (data) => {
      console.log("Send verification successful:", data);
      setSuccess(true);
      setError("");
      setNextRequestAt(data.data?.nextRequestAt || null);
    },
    onError: (errorMessage) => {
      console.error("Send verification error:", errorMessage);
      setError(errorMessage);
      setSuccess(false);
    },
  });

  const onSubmit = async (data: SendVerificationFormData) => {
    setError(""); // Clear previous errors
    setSuccess(false);
    sendVerification(data);
  };

  const isDisabled = isPending || (!isExpired && success);

  return (
    <div className="w-full max-w-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Email Verification</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email to receive a verification link
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="rounded-md bg-primary/10 p-3 text-sm text-primary text-center">
          Verification link has been sent to your email. Please check your inbox.
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
                  <Input placeholder="Your Email" {...field} />
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
                : "Send Verification Link"}
          </Button>
        </form>
      </Form>

      {/* Back to Login */}
      <p className="px-8 text-center text-sm text-muted-foreground">
        Already verified?{" "}
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

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { IconGoogle } from "../ui/icon-google";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useRegister } from "@/services/api-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import { ROUTES } from "@/lib/routes";

const registerSchema = z
  .object({
    email: z.email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema as any),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { mutate: register, isPending } = useRegister({
    onSuccess: (data) => {
      console.log("Registration successful:", data);
      // Redirect to home page after successful registration
      setIsSuccess(true);
    },
    onError: (errorMessage) => {
      console.error("Registration error:", errorMessage);
      setError(errorMessage);
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(""); // Clear previous errors
    register(data);
  };

  const handleContinueWithGoogle = () => {
    // Redirect to backend Google OAuth endpoint
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    window.location.href = `${apiBaseUrl}/auth/google/login`;
  };

  if (isSuccess) {
    return (
      <Empty>
        <EmptyHeader className="max-w-md">
          <EmptyMedia variant="icon" className="text-primary">
            <Check strokeWidth={3} />
          </EmptyMedia>
          <EmptyTitle>Registration Successful</EmptyTitle>
          <EmptyDescription>
            We have sent a verification email to your email address{" "}
            <span className="font-semibold text-foreground">{form.getValues("email")}</span>. Please
            click on the link in the email to verify your account.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            variant="outline"
            className="h-10 w-full rounded-full"
            onClick={() => router.push(ROUTES.LOGIN)}
          >
            <ArrowLeft /> Back to Login
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email below to create new account
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive text-center">
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Your Password" {...field} />
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
            {isPending ? "Signing up..." : "Sign up with Email"}
          </Button>
        </form>
      </Form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      {/* OAuth Buttons */}
      <Button
        type="button"
        variant="outline"
        className="h-10 w-full rounded-full"
        onClick={handleContinueWithGoogle}
      >
        <IconGoogle className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>

      {/* Terms and Privacy */}
      <p className="px-8 text-center text-sm text-muted-foreground">
        Already have account?{" "}
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

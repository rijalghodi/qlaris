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
import { useLogin } from "@/services/api-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ROUTES } from "@/lib/route";

const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string>("");

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema as any),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate: login, isPending } = useLogin({
    onSuccess: (data) => {
      console.log("Login successful:", data);
      // Redirect to home page after successful login
      router.push(ROUTES.DASHBOARD);
    },
    onError: (errorMessage) => {
      console.error("Login error:", errorMessage);
      setError(errorMessage);
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(""); // Clear previous errors
    login(data);
  };

  const handleContinueWithGoogle = () => {
    // TODO: Implement Google OAuth logic
    console.log("Sign in with Google");
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Login to your account</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit(onSubmit);
          }}
          className="space-y-4"
        >
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
          {/* Forgot Password */}
          <p className="text-right text-sm text-muted-foreground">
            <Link
              href="/forgot-password"
              className="hover:underline underline-offset-4 font-medium text-foreground"
            >
              Forgot Password
            </Link>
          </p>

          <Button type="submit" disabled={isPending} className="h-10 w-full rounded-full">
            {isPending ? "Signing in..." : "Sign in with Email"}
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

      {/* Register */}
      <p className="px-8 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="hover:underline underline-offset-4 font-medium text-foreground"
        >
          Register
        </Link>
      </p>
    </div>
  );
}

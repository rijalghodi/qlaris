"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Gift, Github } from "lucide-react";
import Link from "next/link";
import { IconGoogle } from "../ui/icon-google";

export function LoginForm() {
  const [email, setEmail] = useState("");

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement email sign-in logic
    console.log("Sign in with email:", email);
  };

  const handleGithubSignIn = () => {
    // TODO: Implement GitHub OAuth logic
    console.log("Sign in with GitHub");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Testimonial */}
      <div className="relative hidden flex-1 flex-col justify-between bg-[#f5f3ed] p-10 lg:flex">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2">
          <Gift className="h-6 w-6 text-primary" strokeWidth={2.5} />
          <span className="text-lg font-semibold text-foreground">Acme Inc</span>
        </div>

        {/* Testimonial */}
        <blockquote className="space-y-2">
          <p className="text-lg font-medium text-primary">
            "This library has saved me countless hours of work and helped me deliver stunning
            designs to my clients faster than ever before."
          </p>
          <footer className="text-sm text-primary/80">- Sofia Davis</footer>
        </blockquote>
      </div>

      {/* Right side - Login Form */}
      <div className="flex flex-1 items-center justify-center bg-background p-8">
        <div className="w-full max-w-sm space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold">Welcome to Qlaris</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to create/sign in to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="sr-only">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <Button
              type="submit"
              className="h-10 w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
            >
              Sign in with Email
            </Button>
          </form>

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
            className="h-10 w-full"
            onClick={handleGithubSignIn}
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
      </div>
    </div>
  );
}

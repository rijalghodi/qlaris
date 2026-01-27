"use client";

import { LogoText } from "@/components/logos/logo-text";
import { ROUTES } from "@/lib/routes";
import { Gift } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Testimonial */}
      <div className="relative hidden flex-1 flex-col justify-between bg-muted dark:bg-muted/50 p-10 lg:flex">
        {/* Logo and Brand */}
        <Link href={ROUTES.LANDING}>
          <LogoText />
        </Link>

        {/* Testimonial */}
        <blockquote className="space-y-2">
          <p className="text-lg font-medium">
            "This library has saved me countless hours of work and helped me deliver stunning
            designs to my clients faster than ever before."
          </p>
          <footer className="text-sm text-primary/80">- Sofia Davis</footer>
        </blockquote>
      </div>

      {/* Right side - Login Form */}
      <div className="flex flex-1 items-center justify-center bg-background p-8">{children}</div>
    </div>
  );
}

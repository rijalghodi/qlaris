"use client";

import { Gift } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
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
      <div className="flex flex-1 items-center justify-center bg-background p-8">{children}</div>
    </div>
  );
}

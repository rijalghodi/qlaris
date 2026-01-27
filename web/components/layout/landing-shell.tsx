"use client";

import LandingHeader from "@/components/landing/header";
import { FooterSection } from "@/components/landing/footer";

export function LandingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      {/* Main content */}
      <main className="flex-1">{children}</main>
      <FooterSection />
    </div>
  );
}

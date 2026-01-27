"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { ROUTES } from "@/lib/routes";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "../logos/logo";
import { LogoText } from "../logos/logo-text";
import { ThemeSwitcher } from "../layout/theme-switcher";

type Props = {
  className?: string;
};

const navigation = [
  { name: "Features", href: "#features" },
  { name: "FAQ", href: "#faq" },
  { name: "Pricing", href: "#pricing" },
];
export default function LandingHeader({}: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav
        className="container mx-auto max-w-shell flex items-center justify-between p-4 lg:px-8"
        aria-label="Global"
      >
        <div className="flex items-center lg:flex-1 gap-16">
          <Link href="/" className="-m-1.5 p-1.5">
            <LogoText />
          </Link>
          {/* Desktop navigation */}
          <div className="hidden lg:flex lg:gap-x-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium leading-6 hover:bg-accent rounded-full px-5 py-2 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* CTA buttons */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-3">
          <ThemeSwitcher />
          <Button variant="ghost" asChild>
            <Link href={ROUTES.LOGIN}>Login</Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link href={ROUTES.REGISTER}>Get Started</Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Toggle menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t">
          <div className="space-y-2 py-6 px-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <div className="pt-4 space-y-2">
              <Button variant="ghost" asChild className="w-full">
                <Link href={ROUTES.LOGIN}>Login</Link>
              </Button>
              <Button asChild className="w-full rounded-full">
                <Link href={ROUTES.REGISTER}>Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

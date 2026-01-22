"use client";

import { Button } from "../ui/button";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";
import { ArrowRight, Check } from "lucide-react";

const benefits = [
  "No credit card required",
  "Setup in 5 minutes",
  "Free forever plan available",
  "24/7 customer support",
];

export function LastOffer() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary-complement/10 to-background -z-10"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] -z-10"></div>

      <div className="container mx-auto px-4 lg:px-8">
        <div
          className={cn(
            "max-w-4xl mx-auto text-center transition-all duration-700 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          {/* Main content */}
          <div className="space-y-6 mb-8">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Ready to Grow Your Business?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of business owners who trust Qlaris to manage their daily operations.
              Start selling smarter today.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-3xl mx-auto">
            {benefits.map((benefit, index) => (
              <div
                key={benefit}
                className={cn(
                  "flex items-center gap-2  text-sm transition-all duration-500 ease-out",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                )}
                style={{
                  transitionDelay: isVisible ? `${200 + index * 100}ms` : "0ms",
                }}
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <Check className="h-3 w-3" />
                </div>
                <span className="text-left">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div
            className={cn(
              "transition-all duration-700 delay-500 ease-out",
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            )}
          >
            <Button size="lg" className="rounded-full px-12 text-lg h-14" asChild>
              <Link href={ROUTES.REGISTER}>
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";
import { Zap, Package, Users, BarChart3, Tag, Rocket } from "lucide-react";

const features = [
  {
    name: "Quick Checkout",
    description:
      "Process transactions in seconds with cash and QRIS payments. Lightning-fast checkout experience for your customers.",
    icon: Zap,
  },
  {
    name: "Smart Inventory",
    description:
      "Barcode scanning, stock alerts, and product variants. Never run out of stock unexpectedly again.",
    icon: Package,
  },
  {
    name: "Easy Management",
    description:
      "Role-based access for Owner, Manager, and Staff. Simple login with Google, no complex setup needed.",
    icon: Users,
  },
  {
    name: "Real-time Reports",
    description:
      "Daily sales dashboard, transaction history, and profit tracking. Understand your business at a glance.",
    icon: BarChart3,
  },
  {
    name: "Flexible Pricing",
    description:
      "Support for discounts and tax. Multiple payment methods to serve all your customers.",
    icon: Tag,
  },
  {
    name: "Future-Ready",
    description:
      "Multi-outlet support and offline mode coming soon. Grow your business without limitations.",
    icon: Rocket,
  },
];

export function Features() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="features" ref={ref} className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section header */}
        <div
          className={cn(
            "text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Everything You Need to Run Your Business
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed for Indonesian small businesses. Simple to use, yet
            comprehensive.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.name}
                className={cn(
                  "group relative rounded-2xl border bg-card p-8 hover:shadow-lg transition-all duration-500 ",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                )}
                style={{
                  transitionDelay: isVisible ? `${index * 100}ms` : "0ms",
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{feature.name}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

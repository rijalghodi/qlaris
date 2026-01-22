"use client";

import { Button } from "../ui/button";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import Image from "next/image";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";
import { ArrowRight, PlayCircle } from "lucide-react";

export function Hero() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="relative overflow-hidden py-20 lg:py-28">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="container mx-auto px-4 lg:px-8">
        <div
          className={cn(
            "grid gap-12 lg:grid-cols-2 lg:gap-16 items-center transition-all duration-1000 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          {/* Left content */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Manage Your Store <span className="text-primary">with Ease</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-[600px]">
                Simple POS for everyday selling. No training required, start selling in minutes.
                Perfect for Indonesian small businesses.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="rounded-full px-8" asChild>
                <Link href={ROUTES.REGISTER}>
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
                <Link href="#features">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Watch Demo
                </Link>
              </Button>
            </div>

            {/* Trust indicator */}
            <p className="text-sm text-muted-foreground">
              🎉 Trusted by <span className="font-semibold text-foreground">1,000+ businesses</span>{" "}
              across Indonesia
            </p>
          </div>

          {/* Right image */}
          <div
            className={cn(
              "relative transition-all duration-1000 delay-300 ease-out",
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            )}
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border bg-muted">
              <Image
                src="/hero.png"
                alt="Qlaris Dashboard"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Decorative blob */}
            <div className="absolute -z-10 -top-10 -right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { Button } from "../ui/button";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { ArrowRight } from "lucide-react";
import { Section } from "../ui/section";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";

export function CTA() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.5 });

  return (
    <Section className="py-24" id="pricing" ref={ref}>
      <div className="container mx-auto px-4 max-w-shell text-center">
        <h2
          className={cn(
            "text-4xl font-medium tracking-tight sm:text-5xl mb-6 opacity-0",
            isVisible && "animate-appear"
          )}
        >
          Ready to get started?
        </h2>
        <p
          className={cn(
            "text-lg text-muted-foreground mb-10 opacity-0 delay-100",
            isVisible && "animate-appear"
          )}
        >
          Create your free account today. No credit card required.
        </p>

        <div
          className={cn(
            "flex items-center justify-center gap-6 opacity-0 delay-300",
            isVisible && "animate-appear"
          )}
        >
          <Button size="lg" className="rounded-full px-8 h-12 text-base font-semibold" asChild>
            <Link href={ROUTES.REGISTER}>Start Free Trial</Link>
          </Button>
          <Link
            href="/contact"
            className="text-base font-medium flex items-center hover:underline hover:underline-offset-4 transition-all"
          >
            Contact Sales <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </Section>
  );
}

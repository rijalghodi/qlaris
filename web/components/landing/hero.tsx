"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { ROUTES } from "@/lib/routes";
import { Section } from "../ui/section";
import dashboardLight from "@/public/dashboard-light.png";

export function Hero() {
  return (
    <Section className="relative overflow-hidden pt-24 pb-32 md:pt-24 md:pb-48">
      {/* Background */}
      <div className="absolute inset-x-0 bottom-0 top-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute left-1/2 top-1/2 h-[530px] w-full -translate-x-1/2 -translate-y-1/2 md:h-[686px]">
          <div
            className="absolute inset-0 [background-image:linear-gradient(to_right,var(--grid-border,rgba(0,0,0,0.05))_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-border,rgba(0,0,0,0.05))_1px,transparent_1px)] transition-colors duration-500 [background-size:calc(var(--square-size,64px))_calc(var(--square-size,64px))]"
            style={
              {
                "--grid-border": "oklch(.924 .003 255.9)",
                "--background": "oklch(1 0 89.88)",
              } as React.CSSProperties
            }
          >
            <div className="pointer-events-none absolute inset-0 bg-[var(--background)] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
          </div>
          <div className="from-background to-background/0 absolute inset-x-0 top-0 h-40 bg-gradient-to-b"></div>
        </div>
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-medium leading-tight tracking-tight text-foreground sm:text-5xl md:text-7xl">
            Simple Point of Sales <br /> for Growing Business
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Simple POS for everyday selling. No training required, start selling in minutes. Perfect
            for Indonesian small businesses.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Button asChild size="lg" className="rounded-full h-12 px-8 text-base">
              <Link href={ROUTES.LOGIN}>Get Started</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full h-12 px-8 text-base"
            >
              <Link href="mailto:contact@qlaris.com">Contact Us</Link>
            </Button>
          </div>
        </div>
        <div className="mt-20 relative mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="rounded-xl bg-background/50 border shadow-2xl backdrop-blur-sm p-2 ring-1 ring-border/50">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-background">
              <Image
                src={dashboardLight}
                alt="App Dashboard"
                className="object-cover object-left-top"
                priority
                width={1248}
                height={765}
              />
            </div>
          </div>
          {/* Glow effect behind the image */}
          <div className="absolute -inset-4 bg-primary/20 blur-3xl -z-10 rounded-[2rem] opacity-50" />
        </div>
      </div>
    </Section>
  );
}

"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { ROUTES } from "@/lib/routes";
import { Section } from "../ui/section";
import Screenshot from "../ui/screenshot";
import { Mockup, MockupFrame } from "../ui/mockup";
import Glow from "../ui/glow";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";
import heroLight from "@/public/hero-light.png";
import heroDark from "@/public/hero-dark.png";

export function Hero() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <Section ref={ref} className="relative overflow-hidden pt-24 pb-32 md:pt-24 md:pb-48">
      <div className="container relative mx-auto px-4 sm:px-6 max-w-shell">
        <div className="relative flex flex-col items-center z-10 gap-6 text-center sm:gap-12">
          <h1
            className={cn(
              "bg-linear-to-b from-foreground to-foreground dark:to-muted-foreground relative z-10 inline-block bg-clip-text text-4xl sm:text-5xl md:text-7xl leading-tight font-medium text-balance text-transparent drop-shadow-2xl md:leading-tight opacity-0",
              isVisible && "animate-appear"
            )}
          >
            Simple Point of Sales <br /> for Growing Business
          </h1>
          <p
            className={cn(
              "mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl opacity-0 delay-100",
              isVisible && "animate-appear"
            )}
          >
            Simple POS for everyday selling. No training required, start selling in minutes. Perfect
            for Indonesian small businesses.
          </p>
          <div
            className={cn(
              "relative z-10 flex justify-center gap-4 opacity-0 delay-300",
              isVisible && "animate-appear"
            )}
          >
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
        <div className="relative w-full pt-12">
          <MockupFrame
            className={cn("opacity-0 delay-700 z-10 relative", isVisible && "animate-appear")}
            size="small"
          >
            <Mockup type="responsive" className="bg-background/90 w-full rounded-xl border-0">
              <Screenshot
                srcLight={heroLight}
                srcDark={heroDark}
                alt="App Dashboard"
                width={1248}
                height={765}
              />
            </Mockup>
          </MockupFrame>
          <Glow
            variant="top"
            className={cn(
              "opacity-0 delay-1000 z-0 pointer-events-none",
              isVisible && "animate-appear-zoom"
            )}
          />
        </div>
      </div>
    </Section>
  );
}

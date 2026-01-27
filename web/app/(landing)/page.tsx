import { LandingShell } from "@/components/layout/landing-shell";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Testimonies } from "@/components/landing/testimonies";
import { FAQ } from "@/components/landing/faq";
import { CTA } from "@/components/landing/cta";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <Testimonies />
      <FAQ />
      <CTA />
    </>
  );
}

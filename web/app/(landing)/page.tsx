import { LandingShell } from "@/components/layout/landing-shell";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Testimonies } from "@/components/landing/testimonies";
import { FAQ } from "@/components/landing/faq";
import { LastOffer } from "@/components/landing/last-offer";

export default function LandingPage() {
  return (
    <LandingShell>
      <Hero />
      <Features />
      <Testimonies />
      <FAQ />
      <LastOffer />
    </LandingShell>
  );
}

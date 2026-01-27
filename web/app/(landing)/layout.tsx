import LandingHeader from "@/components/landing/header";
import { FooterSection } from "@/components/landing/footer";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandingHeader />
      {children}
      <FooterSection />
    </>
  );
}

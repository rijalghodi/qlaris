"use client";

import {
  BarChart3,
  CreditCard,
  KeyRound,
  Package,
  Percent,
  ScanBarcode,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { ReactNode } from "react";

import { Item, ItemDescription, ItemIcon, ItemTitle } from "../ui/item";
import { Section } from "../ui/section";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";

interface ItemProps {
  title: string;
  description: string;
  icon: ReactNode;
}

interface ItemsProps {
  title?: string;
  items?: ItemProps[] | false;
  className?: string;
}

export function Features({
  title = "Everything you need to run your business",
  items = [
    {
      title: "Role-Based Access",
      description: "Secure access control for Owner, Manager, and Staff members",
      icon: <ShieldCheck className="size-5 stroke-1" />,
    },
    {
      title: "Smart Inventory",
      description: "Manage product variants, stock levels, and categories easily",
      icon: <Package className="size-5 stroke-1" />,
    },
    {
      title: "Barcode Scanning",
      description: "Speed up the checkout process with integrated barcode support",
      icon: <ScanBarcode className="size-5 stroke-1" />,
    },
    {
      title: "Flexible Payments",
      description: "Accept Cash, QRIS, and handle refunds or returns effortlessly",
      icon: <CreditCard className="size-5 stroke-1" />,
    },
    {
      title: "Real-time Reports",
      description: "Track sales, transactions, and business performance instantly",
      icon: <BarChart3 className="size-5 stroke-1" />,
    },
    {
      title: "Easy Login",
      description: "Quick and secure access with your Google account integration",
      icon: <KeyRound className="size-5 stroke-1" />,
    },
    {
      title: "Discounts & Tax",
      description: "Apply discounts and manage tax calculations automatically",
      icon: <Percent className="size-5 stroke-1" />,
    },
    {
      title: "Simple & Fast",
      description: "Designed for speed with a practical interface, no training required",
      icon: <Zap className="size-5 stroke-1" />,
    },
  ],
  className,
}: ItemsProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.5 });

  return (
    <Section className={className} id="features" ref={ref}>
      <div className="max-w-container mx-auto flex flex-col items-center gap-6 sm:gap-20">
        <h2
          className={cn(
            "max-w-[560px] text-center text-3xl leading-tight font-semibold sm:text-5xl sm:leading-tight opacity-0",
            isVisible && "animate-appear"
          )}
        >
          {title}
        </h2>
        {items !== false && items.length > 0 && (
          <div className="grid auto-rows-fr grid-cols-2 gap-0 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {items.map((item, index) => (
              <Item
                key={index}
                className={cn("opacity-0", isVisible && "animate-appear")}
                style={{ animationDelay: `${index * 50 + 200}ms` }}
              >
                <ItemTitle className="flex items-center gap-2">
                  <ItemIcon>{item.icon}</ItemIcon>
                  {item.title}
                </ItemTitle>
                <ItemDescription>{item.description}</ItemDescription>
              </Item>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}

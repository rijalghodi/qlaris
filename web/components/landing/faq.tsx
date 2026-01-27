"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Is Qlaris suitable for my small business?",
    answer:
      "Yes! Qlaris is designed specifically for small businesses in Indonesia. It's easy to use without training, so you can start selling in minutes.",
  },
  {
    question: "How much does the Qlaris subscription cost?",
    answer:
      "Starting from free for basic features. The premium plan starts at Rp 99.000/month with complete features such as detailed reports, multi-user access, and QRIS integration.",
  },
  {
    question: "Do I need the internet to use Qlaris?",
    answer:
      "For basic features, yes. However, offline mode is currently under development and will be coming soon to ensure you can keep selling without an internet connection.",
  },
  {
    question: "How do I start using Qlaris?",
    answer:
      "It's very easy! Sign up for free, add your products, and start selling. No complicated setup or special training needed. You can start within 5 minutes.",
  },
  {
    question: "Is my transaction data safe?",
    answer:
      "Very safe. We use bank-level encryption, automatic daily backups, and servers in Indonesia. Your data is fully protected.",
  },
  {
    question: "Can I use it for multiple stores?",
    answer:
      "Multi-outlet features will be coming soon in the next update! You'll be able to manage multiple stores from a single dashboard.",
  },
];

export function FAQ() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <section id="faq" className="py-24" ref={ref}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2
            className={cn(
              "text-3xl font-semibold tracking-tight sm:text-4xl mb-4 opacity-0",
              isVisible && "animate-appear"
            )}
          >
            Frequently Asked Questions
          </h2>
          <p
            className={cn(
              "text-lg text-muted-foreground opacity-0 delay-100",
              isVisible && "animate-appear"
            )}
          >
            Everything you need to know about Qlaris
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className={cn("opacity-0", isVisible && "animate-appear")}
              style={{ animationDelay: `${index * 100 + 300}ms` }}
            >
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

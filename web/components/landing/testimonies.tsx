"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "Budi Santoso",
    role: "Coffee Shop Owner",
    content:
      "Qlaris has greatly helped with my shop's financial records. It's very easy to use, even for a layperson like me!",
    image: "/avatars/budi.jpg",
  },
  {
    name: "Siti Aminah",
    role: "Boutique Owner",
    content:
      "The stock feature is very accurate. I no longer need to worry about manual counting at the end of every month.",
    image: "/avatars/siti.jpg",
  },
  {
    name: "Rudi Hartono",
    role: "Restaurant Manager",
    content:
      "Daily sales reports are very complete. I can monitor restaurant turnover from anywhere in real-time.",
    image: "/avatars/rudi.jpg",
  },
  {
    name: "Dewi Lestari",
    role: "Mini Market Cashier",
    content:
      "The checkout process is very fast with the barcode scanner. Customers don't need to queue for long when paying.",
    image: "/avatars/dewi.jpg",
  },
  {
    name: "Agus Setiawan",
    role: "Workshop Owner",
    content:
      "The app interface is clean and not confusing. New employees can use it immediately without long training.",
    image: "/avatars/agus.jpg",
  },
  {
    name: "Nina Marlina",
    role: "Franchise Owner",
    content: "A stable and reliable cashier system. Highly recommended for fellow MSME owners.",
    image: "/avatars/nina.jpg",
  },
];

export function Testimonies() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <section className="py-24" ref={ref}>
      <div className="container mx-auto px-4 lg:px-8 max-w-shell">
        <div className="mb-16">
          <h2
            className={cn(
              "text-3xl font-semibold tracking-tight sm:text-4xl mb-4 opacity-0",
              isVisible && "animate-appear"
            )}
          >
            Trusted by MSMEs
          </h2>
          <p
            className={cn(
              "text-lg text-muted-foreground opacity-0 delay-100",
              isVisible && "animate-appear"
            )}
          >
            What they say about their experience using Qlaris.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className={cn(
                "rounded-2xl bg-card p-8 hover:bg-card/80 transition-colors opacity-0",
                isVisible && "animate-appear"
              )}
              style={{ animationDelay: `${index * 100 + 300}ms` }}
            >
              <p className="text-foreground leading-relaxed mb-8 font-medium">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={testimonial.image} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

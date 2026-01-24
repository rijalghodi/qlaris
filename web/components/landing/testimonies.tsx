"use client";

import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    name: "Ibu Siti",
    business: "Warung Makan",
    content:
      "Qlaris membantu saya mengelola toko dengan mudah. Tidak perlu training lama, langsung bisa pakai! Sekarang saya lebih fokus masak dan layani pelanggan.",
    rating: 5,
  },
  {
    name: "Pak Budi",
    business: "Minimarket",
    content:
      "Fitur barcode dan stock alert sangat membantu. Saya bisa fokus melayani pelanggan tanpa khawatir kehabisan stok barang favorit.",
    rating: 5,
  },
  {
    name: "Mbak Ani",
    business: "Kafe",
    content:
      "QRIS payment sangat praktis. Pelanggan senang, saya juga untung karena laporan jelas. Recommended untuk UMKM!",
    rating: 5,
  },
];

export function Testimonies() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="py-20">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section header */}
        <div
          className={cn(
            "text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Loved by Business Owners
          </h2>
          <p className="text-lg text-muted-foreground">
            Hear what our customers have to say about Qlaris
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className={cn(
                "rounded-2xl border bg-card p-8 transition-all duration-500  hover:shadow-lg",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              )}
              style={{
                transitionDelay: isVisible ? `${index * 100}ms` : "0ms",
              }}
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground mb-6">{testimonial.content}</p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted">
                  <Image src="/hero.png" alt={testimonial.name} fill className="object-cover" />
                </div>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.business}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "Apakah Qlaris cocok untuk usaha kecil saya?",
    answer:
      "Ya! Qlaris dirancang khusus untuk UMKM di Indonesia. Mudah digunakan tanpa training, Anda bisa langsung mulai jual dalam hitungan menit.",
  },
  {
    question: "Berapa biaya berlangganan Qlaris?",
    answer:
      "Mulai dari gratis untuk fitur dasar. Paket premium mulai dari Rp 99.000/bulan dengan fitur lengkap seperti laporan detail, multi-user, dan integrasi QRIS.",
  },
  {
    question: "Apakah saya perlu internet untuk menggunakan Qlaris?",
    answer:
      "Untuk fitur dasar, ya. Namun mode offline sedang dalam pengembangan dan akan segera hadir untuk memastikan Anda tetap bisa berjualan tanpa koneksi internet.",
  },
  {
    question: "Bagaimana cara saya mulai menggunakan Qlaris?",
    answer:
      "Sangat mudah! Daftar gratis, tambahkan produk Anda, dan mulai jual. Tidak perlu setup rumit atau training khusus. Dalam 5 menit Anda sudah bisa mulai.",
  },
  {
    question: "Apakah data transaksi saya aman?",
    answer:
      "Sangat aman. Kami menggunakan enkripsi tingkat bank, backup otomatis setiap hari, dan server di Indonesia. Data Anda sepenuhnya terlindungi.",
  },
  {
    question: "Bisakah saya gunakan untuk beberapa toko?",
    answer:
      "Fitur multi-outlet akan segera hadir di update berikutnya! Anda bisa mengelola beberapa toko dari satu dashboard yang sama.",
  },
];

export function FAQ() {
  const { ref, isVisible } = useScrollAnimation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" ref={ref} className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section header */}
        <div
          className={cn(
            "text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">Everything you need to know about Qlaris</p>
        </div>

        {/* FAQ items */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={cn(
                "rounded-lg border bg-card overflow-hidden transition-all duration-500 ease-out",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              )}
              style={{
                transitionDelay: isVisible ? `${index * 50}ms` : "0ms",
              }}
            >
              <button
                className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-muted/50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-base">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-300 ease-in-out",
                  openIndex === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <p className="p-6 pt-0 text-muted-foreground">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

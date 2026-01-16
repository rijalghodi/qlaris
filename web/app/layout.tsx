import type { Metadata } from "next";
import { Barlow, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { BRAND } from "@/lib/brand";

const inter = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: BRAND.SITE_NAME,
  description: BRAND.SITE_DESCRIPTION,
  keywords: BRAND.KEYWORDS,
  authors: [{ name: BRAND.AUTHOR, url: BRAND.AUTHOR_URL }],
  creator: BRAND.AUTHOR,
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: BRAND.SITE_NAME,
    title: BRAND.SITE_NAME,
    description: BRAND.SITE_DESCRIPTION,
    images: [
      {
        url: BRAND.OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: BRAND.SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND.SITE_NAME,
    description: BRAND.SITE_DESCRIPTION,
    images: [BRAND.OG_IMAGE_URL],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${inter.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

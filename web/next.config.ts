import type { NextConfig } from "next";
import { RemotePattern } from "next/dist/shared/lib/image-config";

const envImages = process.env.NEXT_PUBLIC_IMAGE || "";
const urls = envImages.split(",");

const remotePatterns = urls.map((url) => {
  const parsed = new URL(url.trim());
  // return parsed;
  return {
    hostname: parsed.hostname,
    port: parsed.port || undefined,
    protocol: parsed.protocol.replace(":", "") as "http" | "https" | undefined,
  };
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;

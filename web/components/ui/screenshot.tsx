"use client";

import Image, { StaticImageData } from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface ScreenshotProps {
  srcLight: string | StaticImageData;
  srcDark?: string | StaticImageData;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export default function Screenshot({
  srcLight,
  srcDark,
  alt,
  width,
  height,
  className,
}: ScreenshotProps) {
  const { resolvedTheme } = useTheme();
  const [src, setSrc] = useState<string | StaticImageData | null>(null);

  useEffect(() => {
    if (resolvedTheme) {
      setSrc(resolvedTheme === "light" ? srcLight : srcDark || srcLight);
    }
  }, [resolvedTheme, srcLight, srcDark]);

  return (
    <div className="overflow-hidden rounded-xs rounded-b-none">
      {src ? (
        <Image src={src} alt={alt} width={width} height={height} className="block h-auto w-auto" />
      ) : (
        <div
          style={{ width, height }}
          className="flex items-center justify-center text-muted-foreground"
          aria-label={alt}
        >
          <span className="text-xl font-medium opacity-50">
            {width} x {height}
          </span>
        </div>
      )}
    </div>
  );
}

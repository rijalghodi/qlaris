"use client";

import { cn } from "@/lib/utils";

export function BgRectanglePattern({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 w-full h-full bg-[repeating-linear-gradient(45deg,var(--muted),var(--muted)_1px,var(--card)_2px,var(--card)_15px)]",
        className
      )}
    ></div>
  );
}

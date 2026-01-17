"use client";

import { Spinner } from "./spinner";
import { cn } from "@/lib/utils";
import React from "react";

export const LoadingOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    visible?: boolean;
    loaderSize?: number;
    hideLoader?: boolean;
  }
>(({ className, visible = false, hideLoader, children, ...props }, ref) => {
  if (visible) {
    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-[2] top-0 left-0 right-0 bottom-0 bg-background/70 flex items-center justify-center",
          className
        )}
        {...props}
      >
        {children ?? (!hideLoader && <Spinner className="size-5 text-primary" />)}
      </div>
    );
  }
  return null;
});

LoadingOverlay.displayName = "LoadingOverlay";

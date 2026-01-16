"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader, type LucideProps } from "lucide-react";

const spinnerVariants = cva("animate-spin", {
  defaultVariants: {
    size: "default",
  },
  variants: {
    size: {
      default: "size-4",
      icon: "size-10",
      lg: "size-6",
      sm: "size-2",
    },
  },
});

export const Spinner = ({
  className,
  size,
  ...props
}: Partial<LucideProps & VariantProps<typeof spinnerVariants>>) => (
  <Loader className={cn(spinnerVariants({ size }), className)} {...props} />
);
